import { NextRequest, NextResponse } from 'next/server';
import { sessionDb } from '../../db';
import { FileManager } from '../../fileManager';
import { streamDeepResearch } from '../../../../agent/deepresearch';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json({ error: '缺少会话ID' }, { status: 400 });
    }

    // 验证会话存在
    const session = sessionDb.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: '会话不存在' }, { status: 404 });
    }

    // 创建文件管理器
    const fileManager = new FileManager(sessionId);

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 发送初始响应
          const initialData = {
            type: 'session_started',
            sessionId,
            question: session.question,
            status: 'analyzing',
            progress: 0,
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`)
          );

          // 开始研究流程
          const researchStream = streamDeepResearch(
            session.question,
            sessionId,
            session.user_id
          );

          for await (const chunk of researchStream) {
            const nodeNames = Object.keys(chunk);
            if (nodeNames.length > 0) {
              const nodeName = nodeNames[0];
              const nodeState = (chunk as any)[nodeName];

              // 更新数据库状态
              sessionDb.updateState(sessionId, nodeState);

              // 保存生成的文件
              if (
                nodeState.generatedFiles &&
                nodeState.generatedFiles.length > 0
              ) {
                for (const file of nodeState.generatedFiles) {
                  await fileManager.saveFile(file);
                }
              }

              // 发送进度更新
              const progressData = {
                type: 'progress',
                sessionId,
                status: nodeState.status,
                progress: nodeState.progress || 0,
                currentTask: nodeState.currentTaskIndex,
                totalTasks: nodeState.tasks?.length || 0,
                analysis: nodeState.analysis,
                plan: nodeState.plan,
                tasks: nodeState.tasks,
                generatedContent: nodeState.generatedContent,
                error: nodeState.error,
              };

              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(progressData)}\n\n`)
              );

              // 如果完成，生成最终报告
              if (nodeState.status === 'completed' && nodeState.finalReport) {
                const htmlFile = await fileManager.generateFinalReport(
                  nodeState.analysis?.coreTheme || session.question,
                  nodeState.finalReport
                );

                sessionDb.setFinalHtml(sessionId, htmlFile);

                const completedData = {
                  type: 'completed',
                  sessionId,
                  finalReport: nodeState.finalReport,
                  htmlFile,
                  fileTree: fileManager.getFileTree(),
                };

                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(completedData)}\n\n`)
                );
                break;
              }

              // 如果出错
              if (nodeState.status === 'error') {
                const errorData = {
                  type: 'error',
                  sessionId,
                  error: nodeState.error || '未知错误',
                };

                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`)
                );
                break;
              }
            }
          }
        } catch (error: any) {
          console.error('研究流程错误:', error);

          // 更新数据库状态为错误
          sessionDb.updateStatus(sessionId, 'error');

          const errorData = {
            type: 'error',
            sessionId,
            error: error.message || '研究过程中发生错误',
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error: any) {
    console.error('流式研究失败:', error);
    return NextResponse.json(
      { error: '流式研究失败: ' + error.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
