import { HumanMessage } from '@langchain/core/messages';
import { ResearchState } from '../state';
import { createGenerationLLM } from './llm';

// 最终报告生成节点
export async function generateReportNode(
  state: ResearchState
): Promise<Partial<ResearchState>> {
  const { generatedContent, question, messages } = state;

  // 按章节顺序排序内容
  const sortedContent = generatedContent.sort(
    (a, b) => a.sectionIndex - b.sectionIndex
  );

  const reportPrompt = `
  请将以下章节内容整合为一份完整的现代化研究报告，该报告将以美观的HTML格式展示：

  研究问题：${question}

  章节内容：
  ${sortedContent
    .map(
      (section) => `
  ## ${section.title}
  ${section.content}
  `
    )
    .join('\n\n')}

  请生成一份结构化的研究报告，要求：

  **格式要求：**
  1. 使用标准Markdown格式，确保层次清晰
  2. 每个主要章节使用 ## 标题
  3. 子章节使用 ### 和 #### 标题
  4. 重要内容使用**粗体**和*斜体*强调

  **内容结构：**
  1. **执行摘要** - 简洁概括研究核心发现（150-200字）
  2. **研究背景** - 问题背景和研究意义
  3. **主要发现** - 按章节整合的核心内容
  4. **关键洞察** - 提炼的重要观点和趋势
  5. **实践建议** - 具体可行的建议
  6. **结论与展望** - 总结和未来方向
  7. **参考资料** - 相关资源链接

  **展示优化：**
  - 使用表格展示对比数据
  - 使用列表突出要点
  - 使用引用块强调重要观点
  - 添加适当的代码示例（如果适用）
  - 确保内容适合卡片式布局展示

  **质量标准：**
  - 逻辑清晰，层次分明
  - 语言专业，表达准确
  - 内容丰富，见解深刻
  - 格式统一，便于阅读

  直接返回完整的html内容，如果需要css 和js 同样在这个文件中一起生成。
  `;

  const llm = createGenerationLLM();

  const response = await llm.invoke([
    ...messages,
    new HumanMessage(reportPrompt),
  ]);

  return {
    finalReport: response.content as string,
    status: 'completed',
    progress: 100,
    messages: [...messages, new HumanMessage(reportPrompt), response],
  };
}
