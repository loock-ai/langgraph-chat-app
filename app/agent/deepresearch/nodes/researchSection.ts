import { RunnableConfig } from '@langchain/core/runnables';
import { ResearchState } from '../state';
import { ContentSection } from '../types';
import { initializeTools } from '../tools';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { createAnalysisLLM } from './llm';
import { messageContentToString } from './utils';

// 章节研究节点（统一的研究流程）
export async function researchSectionNode(
  state: ResearchState,
  config?: RunnableConfig
): Promise<Partial<ResearchState>> {
  const { plan, generatedContent } = state;

  if (!plan || !plan.sections) {
    return {
      status: 'error',
      error: '缺少研究计划或章节信息',
    };
  }

  // 找到下一个需要研究的章节
  const completedSections = generatedContent.map((c) => c.sectionIndex);
  const nextSectionIndex = plan.sections.findIndex(
    (_, index) => !completedSections.includes(index)
  );

  if (nextSectionIndex === -1) {
    // 所有章节都已完成
    return {
      status: 'generating',
      progress: 80,
    };
  }

  const section = plan.sections[nextSectionIndex];
  const { sessionId } = state;

  // 创建统一的研究 Agent，集成搜索、分析、内容生成功能
  const llm = createAnalysisLLM();

  // 从运行时配置获取工具，如果没有则使用默认初始化
  const allTools =
    config?.configurable?.tools || (await initializeTools(config)).allTools;

  const researchPrompt = `你是一个专业的研究专家，能够完成完整的章节研究工作。你的能力包括：

**信息搜索能力**：
- 制定有效的搜索策略
- 执行多轮搜索获取全面信息
- 筛选和评估信息质量
- 识别权威来源和可靠数据

**深度分析能力**：
- 使用sequential-thinking工具进行深度思考
- 提取关键信息和核心观点
- 发现内在联系和模式
- 评估信息的可靠性和时效性

**内容创作能力**：
- 生成结构化的高质量内容
- 使用适当的Markdown格式
- 包含具体数据和引用来源
- 确保逻辑清晰、论证充分

工作流程：
1. 首先使用搜索工具获取相关信息
2. 然后使用sequential-thinking工具进行深度分析
3. 最后基于分析结果生成完整的章节内容

请确保每个步骤都充分完成，生成的内容具有学术性和专业性。`;

  const researchAgent = createReactAgent({
    llm,
    tools: allTools,
    prompt: researchPrompt,
  });

  const researchInput = {
    messages: [
      {
        role: 'user',
        content: `请完成"${section.title}"章节的完整研究，包括信息搜索、深度分析和内容生成：

章节标题：${section.title}
章节描述：${section.description}
章节优先级：${section.priority}

请按以下步骤完成研究：

1. **信息搜索阶段**：
   - 使用多个搜索查询获取相关信息
   - 搜索权威来源、学术资料、官方文档
   - 重点关注：核心概念、发展历史、技术细节、应用案例

2. **深度分析阶段**：
   - 使用sequential-thinking工具进行深度思考
   - 提取关键信息和核心观点
   - 识别重要数据、事实和趋势
   - 评估信息可靠性和相关性

3. **内容生成阶段**：
   - 基于分析结果生成高质量章节内容
   - 使用清晰的Markdown格式和标题层级
   - 包含具体数据、事实和引用来源
   - 确保逻辑连贯、论证充分

请直接返回最终的章节内容（Markdown格式），包含完整的研究成果。`,
      },
    ],
  };

  try {
    const config = {
      configurable: {
        thread_id: `section-research-${sessionId}-${nextSectionIndex}`,
      },
    };

    const result = await researchAgent.invoke(researchInput, config);

    // 提取生成的内容
    const lastMessage = result.messages[result.messages.length - 1];
    const sectionContent = messageContentToString(lastMessage.content);

    const content: ContentSection = {
      taskId: `section-${nextSectionIndex}`,
      sectionIndex: nextSectionIndex,
      title: section.title,
      content: sectionContent,
      timestamp: new Date(),
    };

    const completedSectionsCount = generatedContent.length + 1;
    const totalSections = plan.sections.length;
    const progress = 40 + (completedSectionsCount / totalSections) * 40;

    return {
      generatedContent: [...state.generatedContent, content],
      messages: [...state.messages, ...result.messages],
      progress,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      status: 'error',
      error: `章节研究失败: ${errorMessage}`,
    };
  }
}
