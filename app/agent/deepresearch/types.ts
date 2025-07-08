import { BaseMessage } from '@langchain/core/messages';

// 研究状态类型
export type ResearchStatus =
  | 'analyzing'
  | 'planning'
  | 'executing'
  | 'generating'
  | 'completed'
  | 'error';

// 问题分析结果
export interface QuestionAnalysis {
  coreTheme: string;
  keywords: string[];
  complexity: 'simple' | 'medium' | 'complex';
  estimatedTime: number;
  researchDirections: string[];
  sourceTypes: string[];
}

// 研究计划
export interface ResearchPlan {
  title: string;
  description: string;
  objectives: string[];
  methodology: string[];
  expectedOutcome: string;
  sections: PlanSection[];
}

// 计划章节
export interface PlanSection {
  title: string;
  description: string;
  priority: number;
}

// 研究任务
export interface ResearchTask {
  id: string;
  type: 'search' | 'analyze' | 'generate' | 'report';
  title: string;
  description: string;
  sectionIndex: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  dependencies: string[];
  result?: unknown;
  error?: string;
}

// 搜索结果
export interface SearchResult {
  taskId: string;
  sectionIndex: number;
  query: string;
  results: {
    content: string;
    source: string;
    timestamp: Date;
  }[];
  timestamp: Date;
}

// 分析结果
export interface AnalysisResult {
  taskId: string;
  sectionIndex: number;
  analysis: {
    summary: string;
    keyPoints: string[];
    insights: string[];
    sources: string[];
  };
  timestamp: Date;
}

// 内容章节
export interface ContentSection {
  taskId: string;
  sectionIndex: number;
  title: string;
  content: string;
  timestamp: Date;
}

// 生成的文件
export interface GeneratedFile {
  id: string;
  sessionId: string;
  name: string;
  type: 'markdown' | 'html' | 'json';
  content: string;
  path: string;
  size: number;
  createdAt: Date;
}

// 研究状态接口
export interface ResearchState {
  // 用户输入
  question: string;
  sessionId: string;
  userId: string;

  // 分析结果
  analysis?: QuestionAnalysis;

  // 研究计划
  plan?: ResearchPlan;

  // 任务列表
  tasks: ResearchTask[];
  currentTaskIndex: number;

  // 执行结果
  searchResults: SearchResult[];
  analysisResults: AnalysisResult[];
  generatedContent: ContentSection[];

  // 最终输出
  finalReport?: string;
  generatedFiles: GeneratedFile[];

  // 状态控制
  status: ResearchStatus;
  progress: number;
  error?: string;

  // 消息历史
  messages: BaseMessage[];
}
