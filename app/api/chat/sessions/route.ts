import { NextResponse } from 'next/server';
import { checkpointer } from '@/app/agent/chatbot';

export async function GET() {
  try {
    // SqliteSaver 的 list 方法可遍历所有 checkpoint，提取 thread_id
    const threadIds = new Set();
    // for await (const item of checkpointer.list({})) {
    //     if (item?.config?.configurable?.thread_id) {
    //         threadIds.add(item.config.configurable.thread_id);
    //     }
    // }
    return NextResponse.json({ sessions: Array.from(threadIds) });
  } catch (e) {
    return NextResponse.json(
      { error: '获取会话列表失败', detail: String(e) },
      { status: 500 }
    );
  }
}
