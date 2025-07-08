import {
  runDeepResearch,
  streamDeepResearch,
  createDeepResearchGraph,
  createInitialState,
} from './index';
import { checkpointer } from '../chatbot';

// 基本使用示例
export async function basicResearchExample() {
  console.log('=== 基本研究示例 ===');

  const question =
    '什么是人工智能？请详细介绍AI的发展历史、核心技术和应用场景。';
  const sessionId = `research-${Date.now()}`;
  const userId = 'user-123';

  try {
    const result = await runDeepResearch(question, sessionId, userId, {
      onProgress: (progress, status) => {
        console.log(`进度: ${progress}% - 状态: ${status}`);
      },
      onError: (error) => {
        console.error('研究错误:', error);
      },
    });

    console.log('研究完成!');
    console.log(
      '最终报告:',
      (result as any)?.finalReport?.substring(0, 500) + '...'
    );
  } catch (error) {
    console.error('研究失败:', error);
  }
}

// 流式执行示例
export async function streamingResearchExample() {
  console.log('\n=== 流式研究示例 ===');

  const question = '区块链技术的原理和应用';
  const sessionId = `stream-research-${Date.now()}`;
  const userId = 'user-456';

  try {
    for await (const chunk of streamDeepResearch(question, sessionId, userId)) {
      const nodeNames = Object.keys(chunk);
      if (nodeNames.length > 0) {
        const nodeName = nodeNames[0];
        const nodeState = (chunk as any)[nodeName];

        console.log(`节点: ${nodeName}`);
        console.log(`状态: ${nodeState.status || 'processing'}`);
        console.log(`进度: ${nodeState.progress || 0}%`);

        if (nodeState.status === 'completed' && nodeState.finalReport) {
          console.log('研究完成!');
          console.log(
            '报告预览:',
            nodeState.finalReport.substring(0, 200) + '...'
          );
        }

        console.log('---');
      }
    }
  } catch (error) {
    console.error('流式研究失败:', error);
  }
}

// 带检查点的研究示例
export async function checkpointResearchExample() {
  console.log('\n=== 带检查点的研究示例 ===');

  const question = '机器学习的基本概念和算法';
  const sessionId = `checkpoint-research-${Date.now()}`;
  const userId = 'user-789';

  try {
    await runDeepResearch(question, sessionId, userId, {
      checkpointer,
      onProgress: (progress, status) => {
        console.log(`[检查点] 进度: ${progress}% - 状态: ${status}`);
      },
      onError: (error) => {
        console.error('[检查点] 研究错误:', error);
      },
    });

    console.log('带检查点的研究完成!');
    console.log('会话ID:', sessionId);
    console.log('可以使用此会话ID恢复研究');
  } catch (error) {
    console.error('带检查点的研究失败:', error);
  }
}

// 手动状态图执行示例
export async function manualGraphExample() {
  console.log('\n=== 手动状态图执行示例 ===');

  const question = '深度学习的发展历程';
  const sessionId = `manual-${Date.now()}`;
  const userId = 'user-manual';

  try {
    // 创建状态图
    const graph = createDeepResearchGraph();

    // 创建初始状态
    const initialState = createInitialState(question, sessionId, userId);

    console.log('开始手动执行状态图...');

    // 执行状态图
    const stream = await graph.stream(initialState);

    for await (const chunk of stream) {
      const nodeNames = Object.keys(chunk);
      if (nodeNames.length > 0) {
        const nodeName = nodeNames[0];
        const nodeState = (chunk as any)[nodeName];

        console.log(`执行节点: ${nodeName}`);

        if (nodeState.analysis) {
          console.log('问题分析完成:', nodeState.analysis.coreTheme);
        }

        if (nodeState.plan) {
          console.log('研究计划生成:', nodeState.plan.title);
          console.log('章节数量:', nodeState.plan.sections?.length || 0);
        }

        if (
          nodeState.generatedContent &&
          nodeState.generatedContent.length > 0
        ) {
          const latestContent =
            nodeState.generatedContent[nodeState.generatedContent.length - 1];
          console.log('生成章节:', latestContent.title);
        }

        if (nodeState.finalReport) {
          console.log('最终报告生成完成!');
          console.log('报告长度:', nodeState.finalReport.length, '字符');
        }

        console.log(`当前进度: ${nodeState.progress || 0}%`);
        console.log('---');
      }
    }

    console.log('手动执行完成!');
  } catch (error) {
    console.error('手动执行失败:', error);
  }
}

// 运行所有示例
export async function runAllExamples() {
  console.log('🚀 开始运行 DeepResearch Agent 示例...\n');

  try {
    await basicResearchExample();
    // await streamingResearchExample();
    // await checkpointResearchExample();
    // await manualGraphExample();

    console.log('\n✅ 所有示例执行完成!');
  } catch (error) {
    console.error('\n❌ 示例执行失败:', error);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  runAllExamples().catch(console.error);
}
