import { ResearchState } from '../state';
import { SearchResult, AnalysisResult, ContentSection } from '../types';
import {
  createSearchAgent,
  createAnalysisAgent,
  createContentGenerationAgent,
} from '../tools';
import {
  messageContentToString,
  extractKeyPoints,
  extractInsights,
  extractSources,
} from './utils';

// 搜索任务执行
export async function executeSearchTask(
  task: { id: string; sectionIndex: number },
  state: ResearchState
): Promise<Partial<ResearchState>> {
  const { plan, sessionId } = state;
  const section = plan?.sections?.[task.sectionIndex];

  if (!section) {
    throw new Error(`找不到章节 ${task.sectionIndex}`);
  }

  const searchAgent = await createSearchAgent();

  const searchInput = {
    messages: [
      {
        role: 'user',
        content: `请搜索关于"${section.title}"的信息。
        
章节描述：${section.description || ''}
搜索重点：${section.title}相关的核心概念、发展历史、技术细节、应用案例等

请使用多个不同的搜索查询来获取全面的信息。`,
      },
    ],
  };

  try {
    const config = {
      configurable: {
        thread_id: `search-${sessionId}-${task.id}`,
      },
    };

    const result = await searchAgent.invoke(searchInput, config);

    // 提取搜索结果
    const lastMessage = result.messages[result.messages.length - 1];
    const searchContent = messageContentToString(lastMessage.content);

    const searchResult: SearchResult = {
      taskId: task.id,
      sectionIndex: task.sectionIndex,
      query: section.title,
      results: [
        {
          content: searchContent,
          source: 'ReactAgent搜索',
          timestamp: new Date(),
        },
      ],
      timestamp: new Date(),
    };

    return {
      searchResults: [...state.searchResults, searchResult],
      messages: [...state.messages, ...result.messages],
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`搜索任务失败: ${errorMessage}`);
  }
}

// 分析任务执行
export async function executeAnalyzeTask(
  task: { id: string; sectionIndex: number },
  state: ResearchState
): Promise<Partial<ResearchState>> {
  const { searchResults, sessionId } = state;

  // 获取对应的搜索结果
  const searchResult = searchResults.find(
    (r) => r.sectionIndex === task.sectionIndex
  );
  if (!searchResult) {
    throw new Error(`找不到章节 ${task.sectionIndex} 的搜索结果`);
  }

  const analysisAgent = await createAnalysisAgent();

  const analysisInput = {
    messages: [
      {
        role: 'user',
        content: `请深入分析以下搜索结果：

搜索查询：${searchResult.query}
搜索结果：
${JSON.stringify(searchResult.results, null, 2)}

请提供结构化的分析，包括：
1. 关键信息摘要
2. 重要观点和洞察
3. 核心数据和事实
4. 信息来源评估
5. 相关性和可靠性分析

请使用sequential-thinking工具进行深度分析。`,
      },
    ],
  };

  try {
    const config = {
      configurable: {
        thread_id: `analysis-${sessionId}-${task.id}`,
      },
    };

    const result = await analysisAgent.invoke(analysisInput, config);

    // 提取分析结果
    const lastMessage = result.messages[result.messages.length - 1];
    const analysisContent = messageContentToString(lastMessage.content);

    // 尝试解析结构化分析结果
    let structuredAnalysis;
    try {
      // 如果返回的是JSON格式
      structuredAnalysis = JSON.parse(analysisContent);
    } catch {
      // 如果不是JSON，则创建结构化格式
      structuredAnalysis = {
        summary: analysisContent.substring(0, 500) + '...',
        keyPoints: extractKeyPoints(analysisContent),
        insights: extractInsights(analysisContent),
        sources: extractSources(analysisContent),
      };
    }

    const analysisResult: AnalysisResult = {
      taskId: task.id,
      sectionIndex: task.sectionIndex,
      analysis: structuredAnalysis,
      timestamp: new Date(),
    };

    return {
      analysisResults: [...state.analysisResults, analysisResult],
      messages: [...state.messages, ...result.messages],
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`分析任务失败: ${errorMessage}`);
  }
}

// 内容生成任务执行
export async function executeGenerateTask(
  task: { id: string; sectionIndex: number },
  state: ResearchState
): Promise<Partial<ResearchState>> {
  const { plan, analysisResults, sessionId } = state;

  const section = plan?.sections?.[task.sectionIndex];
  const analysis = analysisResults.find(
    (r) => r.sectionIndex === task.sectionIndex
  );

  if (!section || !analysis) {
    throw new Error(`找不到章节 ${task.sectionIndex} 的信息或分析结果`);
  }

  const contentAgent = await createContentGenerationAgent();

  const generateInput = {
    messages: [
      {
        role: 'user',
        content: `请基于以下分析结果生成"${section.title}"章节的详细内容：

章节标题：${section.title}
章节要求：${section.description}

分析结果：
${JSON.stringify(analysis.analysis, null, 2)}

请生成：
1. 结构化的章节内容（Markdown格式）
2. 包含适当的标题层级
3. 引用相关来源和数据
4. 逻辑清晰，内容丰富
5. 符合学术写作规范

请使用sequential-thinking工具进行深度思考，确保内容质量。`,
      },
    ],
  };

  try {
    const config = {
      configurable: {
        thread_id: `generate-${sessionId}-${task.id}`,
      },
    };

    const result = await contentAgent.invoke(generateInput, config);

    // 提取生成的内容
    const lastMessage = result.messages[result.messages.length - 1];
    const generatedContent = messageContentToString(lastMessage.content);

    const content: ContentSection = {
      taskId: task.id,
      sectionIndex: task.sectionIndex,
      title: section.title,
      content: generatedContent,
      timestamp: new Date(),
    };

    return {
      generatedContent: [...state.generatedContent, content],
      messages: [...state.messages, ...result.messages],
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`内容生成任务失败: ${errorMessage}`);
  }
}
