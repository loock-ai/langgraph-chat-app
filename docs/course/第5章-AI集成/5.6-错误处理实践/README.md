# 5.6 错误处理实践

## 🎯 学习目标

- 建立健壮的AI应用错误处理机制
- 掌握各种错误场景的处理策略
- 实现用户友好的错误提示
- 提升AI应用的可靠性和稳定性

## 📚 核心内容深度讲解

### AI应用中的错误类型

AI应用面临的错误比传统Web应用更加复杂，包括网络错误、API限制、模型响应异常、状态管理错误等多种类型。

#### 常见错误分类
```typescript
enum ErrorType {
  NETWORK_ERROR = 'network_error',           // 网络连接问题
  API_RATE_LIMIT = 'api_rate_limit',        // API调用限制
  MODEL_ERROR = 'model_error',              // AI模型错误
  VALIDATION_ERROR = 'validation_error',     // 输入验证错误
  STATE_ERROR = 'state_error',              // 状态管理错误
  UNKNOWN_ERROR = 'unknown_error'           // 未知错误
}
```

### 错误处理策略

不同类型的错误需要不同的处理策略。有些错误可以自动重试，有些需要用户重新操作，有些需要降级处理。

#### 错误处理原则
- **用户友好**：错误信息要让用户能理解
- **可恢复性**：尽可能提供恢复方案
- **日志记录**：详细记录错误信息用于调试
- **优雅降级**：在服务不可用时提供备选方案

## 💻 代码实战演示

### 统一错误处理类
```typescript
// app/utils/errorHandler.ts
export class AIErrorHandler {
  // 错误类型映射
  private static errorTypeMap = {
    'insufficient_quota': ErrorType.API_RATE_LIMIT,
    'rate_limit_exceeded': ErrorType.API_RATE_LIMIT,
    'model_overloaded': ErrorType.MODEL_ERROR,
    'invalid_request_error': ErrorType.VALIDATION_ERROR,
  };

  // 获取错误类型
  static getErrorType(error: any): ErrorType {
    if (error?.code && this.errorTypeMap[error.code]) {
      return this.errorTypeMap[error.code];
    }
    
    if (error?.message?.includes('network')) {
      return ErrorType.NETWORK_ERROR;
    }
    
    return ErrorType.UNKNOWN_ERROR;
  }

  // 获取用户友好的错误信息
  static getUserMessage(errorType: ErrorType): string {
    const messages = {
      [ErrorType.NETWORK_ERROR]: '网络连接不稳定，请检查网络后重试',
      [ErrorType.API_RATE_LIMIT]: 'AI服务使用频繁，请稍后再试',
      [ErrorType.MODEL_ERROR]: 'AI模型暂时不可用，请稍后重试',
      [ErrorType.VALIDATION_ERROR]: '输入内容有误，请检查后重新发送',
      [ErrorType.STATE_ERROR]: '会话状态异常，请刷新页面后重试',
      [ErrorType.UNKNOWN_ERROR]: '服务暂时不可用，请稍后重试'
    };
    
    return messages[errorType] || messages[ErrorType.UNKNOWN_ERROR];
  }

  // 判断是否可以重试
  static isRetryable(errorType: ErrorType): boolean {
    return [
      ErrorType.NETWORK_ERROR,
      ErrorType.MODEL_ERROR,
      ErrorType.API_RATE_LIMIT
    ].includes(errorType);
  }

  // 获取重试延迟时间（毫秒）
  static getRetryDelay(errorType: ErrorType, attempt: number): number {
    const baseDelays = {
      [ErrorType.NETWORK_ERROR]: 1000,
      [ErrorType.MODEL_ERROR]: 2000,
      [ErrorType.API_RATE_LIMIT]: 5000
    };
    
    const baseDelay = baseDelays[errorType] || 1000;
    return baseDelay * Math.pow(2, attempt - 1); // 指数退避
  }
}
```

### API错误处理实现
```typescript
// app/api/chat/route.ts - 增强错误处理
export async function POST(request: NextRequest) {
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { message, threadId } = await request.json();

      // 输入验证
      if (!message?.trim()) {
        return NextResponse.json({
          success: false,
          error: '消息内容不能为空',
          errorType: ErrorType.VALIDATION_ERROR
        }, { status: 400 });
      }

      // 创建流式响应（带错误处理）
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          
          try {
            let hasContent = false;
            
            for await (const event of app.streamEvents(
              { messages: [new HumanMessage(message.trim())] },
              { 
                version: 'v2',
                configurable: { thread_id: threadId }
              }
            )) {
              if (event.event === 'on_chat_model_stream') {
                const chunk = event.data?.chunk;
                if (chunk?.content) {
                  hasContent = true;
                  controller.enqueue(
                    encoder.encode(
                      JSON.stringify({ 
                        type: 'chunk', 
                        content: chunk.content 
                      }) + '\n'
                    )
                  );
                }
              }
            }
            
            // 检查是否有内容输出
            if (!hasContent) {
              controller.enqueue(
                encoder.encode(
                  JSON.stringify({ 
                    type: 'error', 
                    message: 'AI模型没有返回内容，请重试',
                    errorType: ErrorType.MODEL_ERROR
                  }) + '\n'
                )
              );
            } else {
              controller.enqueue(
                encoder.encode(JSON.stringify({ type: 'end' }) + '\n')
              );
            }
            
          } catch (streamError) {
            console.error(`流式处理错误 (尝试 ${attempt}):`, streamError);
            
            const errorType = AIErrorHandler.getErrorType(streamError);
            const userMessage = AIErrorHandler.getUserMessage(errorType);
            
            controller.enqueue(
              encoder.encode(
                JSON.stringify({ 
                  type: 'error', 
                  message: userMessage,
                  errorType,
                  retryable: AIErrorHandler.isRetryable(errorType)
                }) + '\n'
              )
            );
          } finally {
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache'
        }
      });

    } catch (error) {
      console.error(`API调用错误 (尝试 ${attempt}):`, error);
      lastError = error;
      
      const errorType = AIErrorHandler.getErrorType(error);
      
      // 如果是可重试的错误且还有重试次数
      if (AIErrorHandler.isRetryable(errorType) && attempt < maxRetries) {
        const delay = AIErrorHandler.getRetryDelay(errorType, attempt);
        console.log(`等待 ${delay}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // 重试次数用完或不可重试的错误
      const userMessage = AIErrorHandler.getUserMessage(errorType);
      return NextResponse.json({
        success: false,
        error: userMessage,
        errorType,
        retryable: false
      }, { status: 500 });
    }
  }

  // 所有重试都失败了
  const errorType = AIErrorHandler.getErrorType(lastError);
  const userMessage = AIErrorHandler.getUserMessage(errorType);
  
  return NextResponse.json({
    success: false,
    error: userMessage,
    errorType,
    retryable: false
  }, { status: 500 });
}
```

### 前端错误处理
```typescript
// 前端错误处理Hook
export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleStreamError = async (
    errorData: any, 
    retryFunction: () => Promise<void>
  ) => {
    setError(errorData.message);
    
    // 如果错误可重试，提供重试选项
    if (errorData.retryable && !isRetrying) {
      console.log('错误可重试，5秒后自动重试...');
      setIsRetrying(true);
      
      setTimeout(async () => {
        try {
          await retryFunction();
          setError(null);
        } catch (retryError) {
          console.error('重试失败:', retryError);
          setError('重试失败，请手动重新发送消息');
        } finally {
          setIsRetrying(false);
        }
      }, 5000);
    }
  };

  const clearError = () => {
    setError(null);
    setIsRetrying(false);
  };

  return {
    error,
    isRetrying,
    handleStreamError,
    clearError
  };
}
```

## 🔧 实践指导

### 错误监控和日志
```typescript
// 错误监控系统
export class ErrorMonitor {
  static logError(error: any, context: string) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      context,
      message: error.message,
      stack: error.stack,
      type: AIErrorHandler.getErrorType(error)
    };
    
    console.error('错误日志:', errorInfo);
    
    // 在生产环境中发送到监控服务
    if (process.env.NODE_ENV === 'production') {
      // 发送到错误监控服务（如Sentry）
    }
  }
}
```

### 用户体验优化
- **加载状态**：显示AI正在处理的状态
- **错误提示**：友好的错误信息和解决建议
- **重试机制**：自动重试和手动重试选项
- **降级方案**：在AI不可用时提供替代功能

### 调试技巧
```typescript
// 开发环境的详细错误信息
if (process.env.NODE_ENV === 'development') {
  console.log('详细错误信息:', {
    originalError: error,
    errorType: AIErrorHandler.getErrorType(error),
    stackTrace: error.stack,
    contextInfo: {
      threadId,
      messageLength: message.length,
      timestamp: new Date().toISOString()
    }
  });
}
```

## 📋 知识点总结

- **错误分类**：不同类型的错误需要不同的处理策略
- **用户体验**：错误信息要友好，提供明确的解决方案
- **自动恢复**：实现重试机制和降级策略
- **监控日志**：完善的错误监控有助于问题定位

## 🚀 课程总结与展望

恭喜完成第5章AI集成的学习！这是整个课程最核心的部分。您现在已经掌握了：
- OpenAI API的深度应用
- LangGraphJS状态图的构建
- 流式响应的完整实现
- 会话和状态的管理
- 项目的完整集成
- 健壮的错误处理机制

接下来的第6章，我们将学习如何构建完整的核心功能，将所有组件整合成一个功能完善的聊天应用！
