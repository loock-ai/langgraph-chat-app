import { Annotation } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import {
  ResearchStatus,
  QuestionAnalysis,
  ResearchPlan,
  ResearchTask,
  SearchResult,
  AnalysisResult,
  ContentSection,
  GeneratedFile,
} from './types';

// 定义状态注解
export const ResearchStateAnnotation = Annotation.Root({
  question: Annotation<string>,
  sessionId: Annotation<string>,
  userId: Annotation<string>,
  analysis: Annotation<QuestionAnalysis | undefined>,
  plan: Annotation<ResearchPlan | undefined>,
  tasks: Annotation<ResearchTask[]>,
  currentTaskIndex: Annotation<number>,
  searchResults: Annotation<SearchResult[]>,
  analysisResults: Annotation<AnalysisResult[]>,
  generatedContent: Annotation<ContentSection[]>,
  finalReport: Annotation<string | undefined>,
  generatedFiles: Annotation<GeneratedFile[]>,
  status: Annotation<ResearchStatus>,
  progress: Annotation<number>,
  error: Annotation<string | undefined>,
  messages: Annotation<BaseMessage[]>,
});

export type ResearchState = typeof ResearchStateAnnotation.State;
