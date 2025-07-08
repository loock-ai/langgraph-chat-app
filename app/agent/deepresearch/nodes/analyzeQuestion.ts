import { HumanMessage } from '@langchain/core/messages';
import { ResearchState } from '../state';
import { QuestionAnalysis } from '../types';
import { createAnalysisLLM } from './llm';

// 问题分析节点
export async function analyzeQuestionNode(
  state: ResearchState
): Promise<Partial<ResearchState>> {
  const { question, messages } = state;

  const analysisPrompt = `
  请分析以下研究问题：${question}
  
  请提供：
  1. 问题的核心主题和关键词
  2. 研究复杂度评估
  3. 预估研究时间
  4. 主要研究方向
  5. 所需信息来源类型
  
  以JSON格式返回结果。
  `;

  const llm = createAnalysisLLM();
  const response = await llm.invoke([
    ...messages,
    new HumanMessage(analysisPrompt),
  ]);

  try {
    let content = response.content as string;

    // 清理 markdown 代码块
    content = content.replace(/```json\s*/, '').replace(/```\s*$/, '');

    const analysis: QuestionAnalysis = JSON.parse(content);

    return {
      analysis,
      status: 'planning',
      progress: 20,
      messages: [...messages, new HumanMessage(analysisPrompt), response],
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      status: 'error',
      error: `问题分析失败: ${errorMessage}`,
      messages: [...messages, new HumanMessage(analysisPrompt), response],
    };
  }
}
