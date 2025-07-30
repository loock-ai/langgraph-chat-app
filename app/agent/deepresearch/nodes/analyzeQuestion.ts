import { HumanMessage } from '@langchain/core/messages';
import { ResearchState } from '../state';
import { QuestionAnalysis } from '../types';
import { createLLM } from './llm';
import { RunnableConfig } from '@langchain/core/runnables';

// 问题分析节点
export async function analyzeQuestionNode(
  state: ResearchState,
  config?: RunnableConfig
): Promise<Partial<ResearchState>> {
  const { question, messages } = state;

  const analysisPrompt = `
请分析以下研究问题：${question}

你必须严格按照以下JSON格式返回分析结果，不要添加任何其他文本或解释：

{
  "coreTheme": "问题的核心主题（字符串）",
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "complexity": "simple|medium|complex（只能是这三个值之一）",
  "estimatedTime": 预估研究时间（数字，单位：小时）,
  "researchDirections": ["研究方向1", "研究方向2", "研究方向3"],
  "sourceTypes": ["信息来源类型1", "信息来源类型2", "信息来源类型3"]
}

要求：
1. 只返回JSON对象，不要任何其他文本
2. complexity必须是"simple"、"medium"或"complex"之一
3. estimatedTime必须是数字（小时）
4. 所有数组至少包含2-5个元素
5. 确保JSON格式完全正确，可以被JSON.parse()解析

现在请分析问题并返回JSON：
  `;

  const llm = createLLM(config?.configurable?.tools);
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
