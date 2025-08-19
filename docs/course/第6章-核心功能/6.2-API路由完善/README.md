# 6.2 API路由完善

## 🎯 学习目标

- 完善聊天API接口的流式响应实现
- 优化历史记录获取和会话管理功能
- 建立健壮的错误处理和验证机制
- 实现生产级的API接口

## 📚 核心内容深度讲解

### API接口架构设计

在这个小节中，我们将完善API路由层，这是连接前端界面和AI后端的关键桥梁。我们需要实现流式响应、历史记录管理、以及完善的错误处理机制。

#### API接口规划
- **POST /api/chat** - 发送消息，支持流式响应
- **GET /api/chat** - 获取指定会话的历史记录
- **GET /api/chat/sessions** - 获取所有会话列表
- **POST /api/chat/sessions** - 创建新会话

### 流式响应的深度实现

流式响应是现代AI聊天应用的核心特性，它让用户能够实时看到AI的回复过程，极大提升了用户体验。

## 💻 代码实战演示

### 完整的流式聊天API实现

#### POST /api/chat - 流式聊天接口
```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { HumanMessage } from '@langchain/core/messages';
import { app } from '@/app/agent';

export async function POST(request: NextRequest) {
  try {
    const { message, threadId } = await request.json();
    
    // 详细的参数验证
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json({
        success: false,
        error: '消息内容不能为空',
        code: 'INVALID_MESSAGE'
      }, { status: 400 });
    }
    
    if (!threadId || typeof threadId !== 'string') {
      return NextResponse.json({
        success: false,
        error: '会话ID无效',
        code: 'INVALID_THREAD_ID'
      }, { status: 400 });
    }
    
    console.log(`收到聊天请求: threadId=${threadId}, messageLength=${message.length}`);
    
    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let hasContent = false;
        let totalChunks = 0;
        
        try {
          // 发送开始信号
          controller.enqueue(
            encoder.encode(
              JSON.stringify({ 
                type: 'start', 
                timestamp: new Date().toISOString() 
              }) + '\n'
            )
          );
          
          // 使用LangGraphJS处理消息
          for await (const event of app.streamEvents(
            { messages: [new HumanMessage(message.trim())] },
            { 
              version: 'v2',
              configurable: { thread_id: threadId }
            }
          )) {
            // 处理AI模型的流式输出
            if (event.event === 'on_chat_model_stream') {
              const chunk = event.data?.chunk;
              if (chunk?.content) {
                hasContent = true;
                totalChunks++;
                
                // 发送内容块
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({ 
                      type: 'chunk', 
                      content: chunk.content,
                      index: totalChunks
                    }) + '\n'
                  )
                );
              }
            }
            
            // 处理其他事件类型（可选）
            else if (event.event === 'on_chain_start') {
              console.log('LangGraph工作流开始');
            }
            else if (event.event === 'on_chain_end') {
              console.log('LangGraph工作流结束');
            }
          }
          
          // 检查是否有内容输出
          if (!hasContent) {
            controller.enqueue(
              encoder.encode(
                JSON.stringify({ 
                  type: 'error', 
                  message: 'AI模型没有返回内容，请重试',
                  code: 'NO_CONTENT'
                }) + '\n'
              )
            );
          } else {
            // 发送结束信号
            controller.enqueue(
              encoder.encode(
                JSON.stringify({ 
                  type: 'end', 
                  totalChunks,
                  timestamp: new Date().toISOString()
                }) + '\n'
              )
            );
          }
          
          console.log(`流式响应完成: ${totalChunks}个内容块`);
          
        } catch (error) {
          console.error('流式处理错误:', error);
          
          // 发送错误信息
          controller.enqueue(
            encoder.encode(
              JSON.stringify({ 
                type: 'error', 
                message: 'AI服务暂时不可用，请稍后重试',
                code: 'AI_SERVICE_ERROR',
                timestamp: new Date().toISOString()
              }) + '\n'
            )
          );
        } finally {
          controller.close();
        }
      }
    });

    // 返回流式响应
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // 禁用Nginx缓冲
      }
    });

  } catch (error) {
    console.error('API错误:', error);
    
    return NextResponse.json({
      success: false,
      error: '服务器内部错误',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}
```

### 历史记录获取API

#### GET /api/chat - 获取会话历史
```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // 参数验证
    if (!threadId) {
      return NextResponse.json({
        success: false,
        error: '缺少会话ID参数',
        code: 'MISSING_THREAD_ID'
      }, { status: 400 });
    }
    
    if (limit < 1 || limit > 100) {
      return NextResponse.json({
        success: false,
        error: '历史记录数量限制在1-100之间',
        code: 'INVALID_LIMIT'
      }, { status: 400 });
    }
    
    console.log(`获取历史记录: threadId=${threadId}, limit=${limit}`);
    
    // 从LangGraph获取会话状态
    const state = await app.getState({
      configurable: { thread_id: threadId }
    });
    
    if (!state?.values?.messages) {
      return NextResponse.json({
        success: true,
        data: {
          threadId,
          history: [],
          total: 0
        }
      });
    }
    
    // 转换消息格式
    const messages = state.values.messages.map((msg: any, index: number) => {
      let role: 'user' | 'assistant' = 'assistant';
      
      // 判断消息类型
      if (msg.constructor?.name === 'HumanMessage' || 
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
    
    // 应用数量限制
    const limitedMessages = messages.slice(-limit);
    
    console.log(`返回历史记录: ${limitedMessages.length}/${messages.length}条消息`);
    
    return NextResponse.json({
      success: true,
      data: {
        threadId,
        history: limitedMessages,
        total: messages.length,
        returned: limitedMessages.length
      }
    });

  } catch (error) {
    console.error('获取历史记录失败:', error);
    
    return NextResponse.json({
      success: false,
      error: '获取历史记录失败',
      code: 'FETCH_HISTORY_ERROR'
    }, { status: 500 });
  }
}
```

### 会话管理API

#### 会话列表和管理
```typescript
// app/api/chat/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { 
  getAllSessions, 
  createSession, 
  updateSessionName, 
  deleteSession 
} from '@/app/agent/db';

// GET - 获取所有会话
export async function GET() {
  try {
    const sessions = getAllSessions();
    
    return NextResponse.json({
      success: true,
      data: {
        sessions,
        total: sessions.length
      }
    });
    
  } catch (error) {
    console.error('获取会话列表失败:', error);
    
    return NextResponse.json({
      success: false,
      error: '获取会话列表失败',
      code: 'FETCH_SESSIONS_ERROR'
    }, { status: 500 });
  }
}

// POST - 创建新会话
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    
    const sessionId = randomUUID();
    const sessionName = name?.trim() || `新会话-${sessionId.slice(0, 8)}`;
    
    createSession(sessionId, sessionName);
    
    console.log(`创建新会话: ${sessionId} - ${sessionName}`);
    
    return NextResponse.json({
      success: true,
      data: {
        id: sessionId,
        name: sessionName
      }
    });
    
  } catch (error) {
    console.error('创建会话失败:', error);
    
    return NextResponse.json({
      success: false,
      error: '创建会话失败',
      code: 'CREATE_SESSION_ERROR'
    }, { status: 500 });
  }
}

// PATCH - 更新会话名称
export async function PATCH(request: NextRequest) {
  try {
    const { id, name } = await request.json();
    
    if (!id || !name?.trim()) {
      return NextResponse.json({
        success: false,
        error: '会话ID和名称不能为空',
        code: 'INVALID_PARAMETERS'
      }, { status: 400 });
    }
    
    updateSessionName(id, name.trim());
    
    console.log(`更新会话名称: ${id} -> ${name}`);
    
    return NextResponse.json({
      success: true,
      data: { id, name: name.trim() }
    });
    
  } catch (error) {
    console.error('更新会话失败:', error);
    
    return NextResponse.json({
      success: false,
      error: '更新会话失败',
      code: 'UPDATE_SESSION_ERROR'
    }, { status: 500 });
  }
}

// DELETE - 删除会话
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: '会话ID不能为空',
        code: 'MISSING_SESSION_ID'
      }, { status: 400 });
    }
    
    deleteSession(id);
    
    console.log(`删除会话: ${id}`);
    
    return NextResponse.json({
      success: true,
      data: { id }
    });
    
  } catch (error) {
    console.error('删除会话失败:', error);
    
    return NextResponse.json({
      success: false,
      error: '删除会话失败',
      code: 'DELETE_SESSION_ERROR'
    }, { status: 500 });
  }
}
```

### API中间件和工具函数

#### 请求日志中间件
```typescript
// app/utils/apiLogger.ts
export function logApiRequest(
  method: string, 
  url: string, 
  duration: number, 
  success: boolean
) {
  const timestamp = new Date().toISOString();
  const status = success ? 'SUCCESS' : 'ERROR';
  
  console.log(`[${timestamp}] ${method} ${url} - ${status} (${duration}ms)`);
  
  // 在生产环境中，这里可以发送到监控系统
  if (process.env.NODE_ENV === 'production' && !success) {
    // 发送错误报告到监控服务
  }
}

// API包装器
export function withApiLogging(handler: Function) {
  return async (request: NextRequest) => {
    const startTime = Date.now();
    const method = request.method;
    const url = request.url;
    
    try {
      const response = await handler(request);
      const duration = Date.now() - startTime;
      
      logApiRequest(method, url, duration, true);
      return response;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logApiRequest(method, url, duration, false);
      console.error('API处理错误:', error);
      
      throw error;
    }
  };
}
```

## 🔧 实践指导

### API测试和验证

#### 1. 流式响应测试
```typescript
// 测试流式响应
async function testStreamingAPI() {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: '请简单介绍一下自己',
      threadId: 'test-' + Date.now()
    })
  });
  
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    console.log('收到数据块:', chunk);
  }
}
```

#### 2. API性能监控
```typescript
// API性能监控
export class APIMonitor {
  private static metrics: Map<string, number[]> = new Map();
  
  static recordResponseTime(endpoint: string, duration: number) {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, []);
    }
    
    const times = this.metrics.get(endpoint)!;
    times.push(duration);
    
    // 只保留最近100次记录
    if (times.length > 100) {
      times.shift();
    }
  }
  
  static getAverageResponseTime(endpoint: string): number {
    const times = this.metrics.get(endpoint) || [];
    if (times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }
}
```

### 错误处理最佳实践

#### 统一错误响应格式
```typescript
// app/utils/apiError.ts
export interface APIError {
  success: false;
  error: string;
  code: string;
  timestamp?: string;
  requestId?: string;
}

export function createErrorResponse(
  error: string, 
  code: string, 
  status: number = 500
): NextResponse {
  return NextResponse.json({
    success: false,
    error,
    code,
    timestamp: new Date().toISOString()
  }, { status });
}

// 常用错误响应
export const APIErrors = {
  INVALID_MESSAGE: () => createErrorResponse('消息内容无效', 'INVALID_MESSAGE', 400),
  MISSING_THREAD_ID: () => createErrorResponse('缺少会话ID', 'MISSING_THREAD_ID', 400),
  AI_SERVICE_ERROR: () => createErrorResponse('AI服务不可用', 'AI_SERVICE_ERROR', 503),
  INTERNAL_ERROR: () => createErrorResponse('服务器内部错误', 'INTERNAL_ERROR', 500)
};
```

## 📋 知识点总结

- **流式响应**：实现实时的AI对话体验
- **历史记录**：完整的会话状态管理
- **错误处理**：健壮的API错误处理机制
- **参数验证**：严格的输入验证和安全检查
- **性能监控**：API性能和错误监控

## 🚀 下一步展望

完成了API路由的完善后，我们将学习6.3小节的前端聊天界面实现，了解如何构建现代化的聊天UI，以及如何与我们刚刚完善的API接口进行交互。

