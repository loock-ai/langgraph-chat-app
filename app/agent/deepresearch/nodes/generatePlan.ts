import { HumanMessage } from '@langchain/core/messages';
import { ResearchState } from '../state';
import { ResearchPlan } from '../types';
import { createAnalysisLLM } from './llm';

// 计划生成节点
export async function generatePlanNode(
  state: ResearchState
): Promise<Partial<ResearchState>> {
  const { question, analysis, messages } = state;

  const planPrompt = `
  基于问题分析结果，制定详细的研究计划：
  
  问题：${question}
  分析：${JSON.stringify(analysis, null, 2)}
  
  请生成包含以下内容的研究计划，必须严格按照以下JSON格式返回：
  
  {
    "title": "研究标题",
    "description": "研究描述",
    "objectives": ["目标1", "目标2"],
    "methodology": ["方法1", "方法2"],
    "expectedOutcome": "预期成果",
    "sections": [
      {
        "title": "章节1标题",
        "description": "章节1描述",
        "priority": 1
      },
      {
        "title": "章节2标题", 
        "description": "章节2描述",
        "priority": 2
      }
    ]
  }
  
  请确保sections数组包含至少3个章节，每个章节都有title、description和priority字段。
  `;

  const llm = createAnalysisLLM();
  const response = await llm.invoke([
    ...messages,
    new HumanMessage(planPrompt),
  ]);

  try {
    let content = response.content as string;

    // 清理 markdown 代码块
    content = content.replace(/```json\s*/, '').replace(/```\s*$/, '');

    const plan: ResearchPlan = JSON.parse(content);

    return {
      plan,
      status: 'executing',
      progress: 30,
      messages: [...messages, new HumanMessage(planPrompt), response],
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      status: 'error',
      error: `计划生成失败: ${errorMessage}`,
      messages: [...messages, new HumanMessage(planPrompt), response],
    };
  }
}
