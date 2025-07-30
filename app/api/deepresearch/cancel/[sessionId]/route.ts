import { NextRequest, NextResponse } from 'next/server';
import { sessionDb } from '../../db';

export async function POST(
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

    // 检查会话状态
    if (session.status === 'completed' || session.status === 'cancelled') {
      return NextResponse.json(
        { error: '会话已完成或已取消，无法取消' },
        { status: 400 }
      );
    }

    // 更新会话状态为已取消
    sessionDb.updateStatus(sessionId, 'cancelled', session.progress || 0);

    return NextResponse.json({
      success: true,
      sessionId,
      message: '研究已取消',
    });
  } catch (error: any) {
    console.error('取消研究失败:', error);
    return NextResponse.json(
      { error: '取消研究失败: ' + error.message },
      { status: 500 }
    );
  }
}
