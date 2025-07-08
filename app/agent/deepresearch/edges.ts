import { ResearchState } from './state';

// 条件边：检查章节是否全部完成
export function shouldContinueResearch(state: ResearchState): string {
  const { plan, generatedContent } = state;

  if (!plan || !plan.sections) {
    return 'generate_report';
  }

  // 检查是否所有章节都已完成
  const completedSections = generatedContent.map((c) => c.sectionIndex);
  const allSectionsCompleted = plan.sections.every((_, index) =>
    completedSections.includes(index)
  );

  if (allSectionsCompleted) {
    return 'generate_report';
  }

  return 'research_section';
}

// 条件边：检查是否有错误
export function checkForErrors(state: ResearchState): string {
  if (state.status === 'error') {
    return 'error_handler';
  }

  return 'continue';
}

// 条件边：检查任务执行状态
export function checkTaskStatus(state: ResearchState): string {
  const { tasks, currentTaskIndex } = state;

  if (currentTaskIndex >= tasks.length) {
    return 'generate_report';
  }

  const currentTask = tasks[currentTaskIndex];

  // 检查依赖任务是否完成
  const dependenciesCompleted = currentTask.dependencies.every((depId) => {
    const depTask = tasks.find((t) => t.id === depId);
    return depTask && depTask.status === 'completed';
  });

  if (!dependenciesCompleted) {
    return 'wait_dependencies';
  }

  return 'execute_task';
}

// 条件边：根据任务类型路由
export function routeByTaskType(state: ResearchState): string {
  const { tasks, currentTaskIndex } = state;

  if (currentTaskIndex >= tasks.length) {
    return 'generate_report';
  }

  const currentTask = tasks[currentTaskIndex];

  switch (currentTask.type) {
    case 'search':
      return 'execute_search';
    case 'analyze':
      return 'execute_analyze';
    case 'generate':
      return 'execute_generate';
    case 'report':
      return 'generate_report';
    default:
      return 'error_handler';
  }
}
