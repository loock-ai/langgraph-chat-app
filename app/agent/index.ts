// 简单的聊天机器人
export {
  getApp,
  runStreamingChatbot,
  runStreamingStates,
  StreamingHandler,
  runCustomStreamingHandler,
  runBatchStreaming,
  checkpointer,
} from './chatbot';

// 工具定义
export {
  allTools,
  calculator,
  weatherTool,
  timeTool,
  searchTool,
} from './tools';

// DeepResearch Agent
export {
  createDeepResearchGraph,
  createDeepResearchGraphWithCheckpoint,
  runDeepResearch,
  streamDeepResearch,
  getResearchState,
  resumeResearch,
  createInitialState,
  validateState,
  type ResearchState,
  type QuestionAnalysis,
  type ResearchPlan,
  type ResearchTask,
  type SearchResult,
  type AnalysisResult,
  type ContentSection,
  type GeneratedFile,
  type ResearchStatus,
} from './deepresearch';

// 辅助函数
export function formatMessagesForAgent(messages: any[]) {
  return messages.map((msg) => {
    if (msg.role === 'user') {
      return { content: msg.content, type: 'human' };
    } else if (msg.role === 'assistant') {
      return { content: msg.content, type: 'ai' };
    }
    return msg;
  });
}
