import { NextRequest, NextResponse } from 'next/server';
import { FileManager } from '../../../fileManager';
import { sessionDb } from '../../../db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; path: string[] }> }
) {
  try {
    const { sessionId, path } = await params;

    if (!sessionId || !path || path.length === 0) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 验证会话存在
    const session = sessionDb.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: '会话不存在' }, { status: 404 });
    }

    // 构建文件路径
    const filePath = path.join('/');

    // 获取文件管理器
    const fileManager = new FileManager(sessionId);

    // 读取文件内容
    const content = await fileManager.readFile(filePath);

    if (content === null) {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 });
    }

    // 根据文件扩展名设置Content-Type
    const extension = filePath.split('.').pop()?.toLowerCase();
    let contentType = 'text/plain';

    switch (extension) {
      case 'html':
        contentType = 'text/html';
        break;
      case 'css':
        contentType = 'text/css';
        break;
      case 'js':
        contentType = 'application/javascript';
        break;
      case 'json':
        contentType = 'application/json';
        break;
      case 'md':
        contentType = 'text/markdown';
        break;
      default:
        contentType = 'text/plain';
    }

    return new Response(content, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('获取文件内容失败:', error);
    return NextResponse.json(
      { error: '获取文件内容失败: ' + error.message },
      { status: 500 }
    );
  }
}
