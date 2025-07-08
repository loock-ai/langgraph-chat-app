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
  请将以下章节内容整合为一份完整的研究报告：

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

  请生成：
  1. 完整的研究报告（Markdown格式）
  2. 包含目录、摘要、结论
  3. 统一的格式和风格
  4. 适当的引用和参考文献

  直接返回完整的Markdown报告。
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
