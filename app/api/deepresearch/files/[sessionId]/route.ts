import { NextRequest, NextResponse } from 'next/server';
import { FileManager } from '../../fileManager';
import { sessionDb } from '../../db';

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

    // 获取文件管理器
    const fileManager = new FileManager(sessionId);

    // 返回文件列表和文件树
    const responseData = {
      sessionId,
      files: fileManager.getFileList(),
      fileTree: fileManager.getFileTree(),
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('获取文件列表失败:', error);
    return NextResponse.json(
      { error: '获取文件列表失败: ' + error.message },
      { status: 500 }
    );
  }
}
