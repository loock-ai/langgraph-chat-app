import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { sessionDb } from '../db';
import { FileManager } from '../fileManager';
import { streamDeepResearch } from '../../../agent/deepresearch';

export async function POST(request: NextRequest) {
  try {
    const { question, userId } = await request.json();

    if (!question || !userId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 生成会话ID
    const sessionId = uuidv4();

    // 创建会话记录
    sessionDb.create(sessionId, userId, question);

    // 返回会话ID，让前端通过另一个端点获取流式数据
    return NextResponse.json({
      sessionId,
      message: '研究会话已创建',
    });
  } catch (error: any) {
    console.error('启动研究失败:', error);
    return NextResponse.json(
      { error: '启动研究失败: ' + error.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
