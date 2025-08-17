# 5.4 会话和状态管理

## 🎯 学习目标

- 理解LangGraphJS中的会话管理机制
- 掌握Thread配置和状态持久化
- 学会多轮对话的状态管理
- 实现可靠的历史记录功能

## 📚 核心内容深度讲解

### Thread会话管理

在LangGraphJS中，每个会话通过thread_id来标识。这个机制让我们能够为不同的用户或不同的对话主题维护独立的状态。

#### Thread配置原理
```typescript
// 每个会话都有唯一的thread_id
const threadConfig = {
  configurable: { thread_id: 'user-123-session-456' }
};

// 在调用时传递配置
const response = await app.invoke(input, threadConfig);
```

### 检查点状态持久化

SqliteSaver不仅保存消息历史，还保存整个工作流的状态，这使得我们可以在任何时候恢复对话。

#### 状态保存和恢复
```typescript
// 保存状态（自动完成）
await app.invoke(
  { messages: [new HumanMessage('你好')] },
  { configurable: { thread_id: sessionId } }
);

// 获取保存的状态
const savedState = await app.getState({
  configurable: { thread_id: sessionId }
});

console.log('历史消息:', savedState?.values?.messages || []);
```

### 多会话管理策略

在实际应用中，我们需要管理多个并发的会话，每个会话都有自己的状态和历史。

## 💻 代码实战演示

### 会话管理工具函数
```typescript
// app/utils/sessionManager.ts
import { app } from '@/app/agent/chatbot';

export class SessionManager {
  // 生成新的会话ID
  static generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // 获取会话历史
  static async getSessionHistory(sessionId: string) {
    try {
      const state = await app.getState({
        configurable: { thread_id: sessionId }
      });
      
      return state?.values?.messages || [];
    } catch (error) {
      console.error('获取会话历史失败:', error);
      return [];
    }
  }

  // 检查会话是否存在
  static async sessionExists(sessionId: string): Promise<boolean> {
    try {
      const state = await app.getState({
        configurable: { thread_id: sessionId }
      });
      return state?.values?.messages && state.values.messages.length > 0;
    } catch (error) {
      return false;
    }
  }

  // 清理会话状态
  static async clearSession(sessionId: string) {
    // 注意：LangGraphJS的checkpointer通常不支持删除
    // 这里我们可以通过创建新的sessionId来实现"清理"
    console.log(`会话 ${sessionId} 已标记为清理`);
  }
}
```

### API中的会话状态处理
```typescript
// app/api/chat/route.ts - GET方法处理历史记录
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get('threadId');

  if (!threadId) {
    return NextResponse.json({
      success: false,
      error: '缺少会话ID'
    }, { status: 400 });
  }

  try {
    // 获取会话历史
    const history = await SessionManager.getSessionHistory(threadId);
    
    // 转换为前端需要的格式
    const messages = history.map((msg: any, index: number) => {
      let role: 'user' | 'assistant' = 'assistant';
      
      // 判断消息类型
      if (msg.constructor.name === 'HumanMessage' || 
          (Array.isArray(msg.id) && msg.id.includes('HumanMessage'))) {
        role = 'user';
      }
      
      return {
        id: String(index + 1),
        content: msg.content || msg.kwargs?.content || '',
        role,
        timestamp: new Date().toISOString(),
        sessionId: threadId
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        threadId,
        history: messages
      }
    });

  } catch (error) {
    console.error('获取历史记录失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取历史记录失败'
    }, { status: 500 });
  }
}
```

### 前端会话状态管理
```typescript
// 前端会话管理Hook
import { useState, useEffect } from 'react';

export function useSessionManager() {
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [sessionHistory, setSessionHistory] = useState<Message[]>([]);

  // 创建新会话
  const createNewSession = () => {
    const newSessionId = `session-${Date.now()}`;
    setCurrentSessionId(newSessionId);
    setSessionHistory([]);
    
    // 保存到localStorage
    localStorage.setItem('currentSessionId', newSessionId);
    return newSessionId;
  };

  // 加载会话历史
  const loadSessionHistory = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat?threadId=${sessionId}`);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data.history)) {
        setSessionHistory(data.data.history);
      }
    } catch (error) {
      console.error('加载会话历史失败:', error);
    }
  };

  // 初始化时恢复会话
  useEffect(() => {
    const savedSessionId = localStorage.getItem('currentSessionId');
    if (savedSessionId) {
      setCurrentSessionId(savedSessionId);
      loadSessionHistory(savedSessionId);
    } else {
      createNewSession();
    }
  }, []);

  return {
    currentSessionId,
    sessionHistory,
    createNewSession,
    loadSessionHistory,
    setCurrentSessionId
  };
}
```

## 🔧 实践指导

### 状态管理最佳实践
1. **唯一标识**：确保每个会话都有唯一的thread_id
2. **状态一致性**：前后端状态保持同步
3. **错误恢复**：处理状态加载失败的情况
4. **内存优化**：避免加载过多历史消息

### 调试技巧
```typescript
// 调试会话状态
const debugSessionState = async (sessionId: string) => {
  const state = await app.getState({
    configurable: { thread_id: sessionId }
  });
  
  console.log('会话状态:', {
    sessionId,
    messageCount: state?.values?.messages?.length || 0,
    lastMessage: state?.values?.messages?.slice(-1)[0]?.content || 'None'
  });
};
```

### 性能优化
- **懒加载**：需要时才加载历史记录
- **分页处理**：大量历史消息的分页显示
- **缓存策略**：适当缓存最近的会话状态
- **清理机制**：定期清理过期的会话数据

## 📋 知识点总结

- **Thread机制**：LangGraphJS的会话隔离机制
- **状态持久化**：SqliteSaver的自动状态保存
- **历史管理**：多轮对话的完整历史记录
- **前后端同步**：确保状态在前后端保持一致

## 🚀 下一步展望

掌握了会话和状态管理后，我们将学习5.5小节的实际项目集成，了解如何将所有AI功能完整地集成到Next.js项目中。
