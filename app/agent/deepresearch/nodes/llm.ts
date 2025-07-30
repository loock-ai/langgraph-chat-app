import { ChatOpenAI } from '@langchain/openai';

// 初始化 OpenAI 模型
export const createLLM = (tools: any[]) => {
  const llm = new ChatOpenAI({
    model: process.env.OPENAI_MODEL_NAME || 'gpt-4',
    temperature: 0.7,
  });

  if (tools) {
    llm.bindTools(tools);
  }

  return llm;
};

// 为不同用途创建特定配置的 LLM
export const createAnalysisLLM = () =>
  new ChatOpenAI({
    model: process.env.OPENAI_MODEL_NAME || 'gpt-4',
    temperature: 0.2, // 分析需要更低的温度
  });

export const createGenerationLLM = () =>
  new ChatOpenAI({
    model: process.env.OPENAI_MODEL_NAME || 'gpt-4',
    temperature: 0.3, // 内容生成需要适中的温度
  });

export const createSearchLLM = () =>
  new ChatOpenAI({
    model: process.env.OPENAI_MODEL_NAME || 'gpt-4',
    temperature: 0.1, // 搜索需要最低的温度
  });
