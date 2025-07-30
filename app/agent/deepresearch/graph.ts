import {
  StateGraph,
  START,
  END,
  BaseCheckpointSaver,
} from '@langchain/langgraph';
import { ResearchStateAnnotation, ResearchState } from './state';
import {
  analyzeQuestionNode,
  generatePlanNode,
  researchSectionNode,
  generateReportNode,
} from './nodes';
import { shouldContinueResearch } from './edges';

// // 创建 DeepResearch 状态图
// export function createDeepResearchGraph() {
//   const workflow = new StateGraph(ResearchStateAnnotation)
//     // 添加节点
//     .addNode('analyze_question', analyzeQuestionNode)
//     .addNode('generate_plan', generatePlanNode)
//     .addNode('research_section', researchSectionNode)
//     .addNode('generate_report', generateReportNode)

//     // 添加边
//     .addEdge(START, 'analyze_question')
//     .addEdge('analyze_question', 'generate_plan')
//     .addEdge('generate_plan', 'research_section')

//     // 条件边：检查是否继续研究章节
//     .addConditionalEdges('research_section', shouldContinueResearch, {
//       research_section: 'research_section',
//       generate_report: 'generate_report',
//     })

//     .addEdge('generate_report', END);

//   return workflow.compile();
// }

// 创建带检查点的状态图
export function createDeepResearchGraph(
  checkpointer: BaseCheckpointSaver<number>
) {
  const workflow = new StateGraph(ResearchStateAnnotation)
    // 添加节点
    .addNode('analyze_question', analyzeQuestionNode)
    .addNode('generate_plan', generatePlanNode)
    .addNode('research_section', researchSectionNode)
    .addNode('generate_report', generateReportNode)

    // 添加边
    .addEdge(START, 'analyze_question')
    .addEdge('analyze_question', 'generate_plan')
    .addEdge('generate_plan', 'research_section')

    // 条件边：检查是否继续研究章节
    .addConditionalEdges('research_section', shouldContinueResearch, {
      research_section: 'research_section',
      generate_report: 'generate_report',
    })

    .addEdge('generate_report', END);

  return workflow.compile({ checkpointer });
}

export const createDeepResearchGraphWithCheckpoint = createDeepResearchGraph;

// 辅助函数：创建初始状态
export function createInitialState(
  question: string,
  sessionId: string,
  userId: string
): Partial<ResearchState> {
  return {
    question,
    sessionId,
    userId,
    tasks: [],
    currentTaskIndex: 0,
    searchResults: [],
    analysisResults: [],
    generatedContent: [],
    generatedFiles: [],
    status: 'analyzing',
    progress: 0,
    messages: [],
  };
}

// 辅助函数：验证状态
export function validateState(state: Partial<ResearchState>): boolean {
  return !!(
    state.question &&
    state.sessionId &&
    state.userId &&
    state.status &&
    typeof state.progress === 'number'
  );
}
