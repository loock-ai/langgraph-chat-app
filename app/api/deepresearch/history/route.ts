import { NextRequest, NextResponse } from 'next/server';
import { sessionDb } from '../db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 });
    }

    // 获取用户的所有研究会话
    const sessions = sessionDb.getUserSessions(userId);

    // 格式化返回数据
    const formattedSessions = sessions.map((session: any) => ({
      id: session.id,
      question: session.question,
      status: session.status,
      progress: session.progress,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
    }));

    return NextResponse.json({
      sessions: formattedSessions,
      total: formattedSessions.length,
    });
  } catch (error: any) {
    console.error('获取历史记录失败:', error);
    return NextResponse.json(
      { error: '获取历史记录失败: ' + error.message },
      { status: 500 }
    );
  }
}
