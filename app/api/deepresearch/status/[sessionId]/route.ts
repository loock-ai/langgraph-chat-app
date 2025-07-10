import { NextRequest, NextResponse } from 'next/server';
import { sessionDb, fileDb } from '../../db';
import { FileManager } from '../../fileManager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json({ error: '缺少会话ID' }, { status: 400 });
    }

    // 获取会话信息
    const session = sessionDb.get(sessionId);

    if (!session) {
      return NextResponse.json({ error: '会话不存在' }, { status: 404 });
    }

    // 解析状态数据
    let stateData = null;
    if (session.state_data) {
      try {
        stateData = JSON.parse(session.state_data);
      } catch (error) {
        console.error('解析状态数据失败:', error);
      }
    }

    // 获取文件管理器
    const fileManager = new FileManager(sessionId);

    // 构建响应数据
    const responseData = {
      sessionId: session.id,
      userId: session.user_id,
      question: session.question,
      status: session.status,
      progress: session.progress,
      outputPath: session.output_path,
      finalHtmlFile: session.final_html_file,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      state: stateData,
      fileTree: fileManager.getFileTree(),
      files: fileManager.getFileList(),
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('获取状态失败:', error);
    return NextResponse.json(
      { error: '获取状态失败: ' + error.message },
      { status: 500 }
    );
  }
}
