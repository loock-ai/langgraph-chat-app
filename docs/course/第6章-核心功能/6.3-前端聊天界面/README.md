# 6.3 前端聊天界面

## 🎯 学习目标

- 设计和实现现代化的聊天用户界面
- 构建响应式的消息列表和输入组件
- 实现实时状态显示和交互反馈
- 建立完整的前端状态管理系统

## 📚 核心内容深度讲解

### 聊天界面设计原理

在这个小节中，我们将构建一个现代化、用户友好的聊天界面。这个界面需要支持实时消息显示、流式响应、历史记录加载，以及优秀的用户交互体验。

#### 界面架构设计
```
ChatPage (主页面)
├── ChatHeader (头部)
├── MessageList (消息列表)
│   ├── UserMessage (用户消息)
│   ├── AssistantMessage (AI消息)
│   └── TypingIndicator (输入指示器)
├── ChatInput (输入区域)
└── LoadingState (加载状态)
```

### 现代UI设计原则

我们的聊天界面将遵循现代UI设计的最佳实践：
- **简洁明了**：清晰的视觉层次和布局
- **响应式设计**：适配不同屏幕尺寸
- **实时反馈**：即时的状态更新和动画效果
- **可访问性**：支持键盘导航和屏幕阅读器

## 💻 代码实战演示

### 主聊天页面实现

#### 聊天页面核心组件
```typescript
// app/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Message } from '@/app/types';
import { getOrCreateThreadId } from '@/app/utils/threadId';
import ChatHeader from '@/app/components/ChatHeader';
import MessageList from '@/app/components/MessageList';
import ChatInput from '@/app/components/ChatInput';
import LoadingState from '@/app/components/LoadingState';

export default function ChatPage() {
  // 状态管理
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 引用
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 初始化会话
  useEffect(() => {
    const initSession = async () => {
      try {
        const threadId = getOrCreateThreadId();
        setSessionId(threadId);
        
        // 加载历史记录
        await loadHistory(threadId);
        
      } catch (error) {
        console.error('初始化失败:', error);
        setError('初始化聊天失败，请刷新页面重试');
      }
    };
    
    initSession();
  }, []);

  // 加载历史记录
  const loadHistory = async (threadId: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/chat?threadId=${threadId}`);
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data.history)) {
        setMessages(data.data.history);
        console.log(`加载历史记录: ${data.data.history.length}条消息`);
      }
      
    } catch (error) {
      console.error('加载历史失败:', error);
      setError('加载历史记录失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  };

  // 消息滚动效果
  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, streamingMessageId]);

  // 发送消息处理
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading || !sessionId) {
      return;
    }

    // 创建用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
      sessionId
    };

    // 立即显示用户消息
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // 创建流式响应消息占位符
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      sessionId,
      isStreaming: true
    };

    setMessages(prev => [...prev, assistantMessage]);
    setStreamingMessageId(assistantMessageId);

    try {
      // 处理流式响应
      await handleStreamingResponse(content, assistantMessageId);
      
    } catch (error) {
      console.error('发送消息失败:', error);
      setError('发送消息失败，请重试');
      
      // 移除失败的消息
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
      
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
    }
  };

  // 流式响应处理
  const handleStreamingResponse = async (message: string, messageId: string) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, threadId: sessionId }),
      signal: abortControllerRef.current.signal
    });

    if (!response.ok) {
      throw new Error('API请求失败');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const data = JSON.parse(line);
            
            if (data.type === 'chunk' && data.content) {
              // 更新流式消息内容
              setMessages(prev => prev.map(msg =>
                msg.id === messageId
                  ? { ...msg, content: msg.content + data.content }
                  : msg
              ));
            } else if (data.type === 'end') {
              // 流式响应结束
              setMessages(prev => prev.map(msg =>
                msg.id === messageId
                  ? { ...msg, isStreaming: false }
                  : msg
              ));
              break;
            } else if (data.type === 'error') {
              throw new Error(data.message || '流式响应错误');
            }
          } catch (parseError) {
            console.error('解析响应错误:', parseError, 'Line:', line);
          }
        }
      }
    }
  };

  // 清除错误
  const clearError = () => setError(null);

  // 加载状态
  if (!sessionId) {
    return <LoadingState message="正在初始化聊天..." />;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* 头部 */}
      <ChatHeader 
        sessionId={sessionId}
        messageCount={messages.length}
        onNewSession={() => window.location.reload()}
      />
      
      {/* 错误提示 */}
      {error && (
        <div className="mx-4 mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-red-700">{error}</span>
            <button 
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto">
        <MessageList 
          messages={messages}
          streamingMessageId={streamingMessageId}
          isLoading={isLoading}
        />
        <div ref={messagesEndRef} />
      </div>
      
      {/* 输入区域 */}
      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={isLoading}
        placeholder={isLoading ? "AI正在回复中..." : "输入消息..."}
      />
    </div>
  );
}
```

### 消息类型定义

#### TypeScript类型定义
```typescript
// app/types/index.ts
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  sessionId: string;
  isStreaming?: boolean;
  error?: boolean;
}

export interface Session {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StreamEvent {
  type: 'start' | 'chunk' | 'end' | 'error';
  content?: string;
  message?: string;
  code?: string;
  timestamp?: string;
  index?: number;
  totalChunks?: number;
}
```

### 消息列表组件

#### MessageList组件实现
```typescript
// app/components/MessageList.tsx
import React from 'react';
import { Message } from '@/app/types';
import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  streamingMessageId: string | null;
  isLoading: boolean;
}

export default function MessageList({ 
  messages, 
  streamingMessageId, 
  isLoading 
}: MessageListProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {messages.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl">🤖</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            欢迎使用LangGraph智能聊天
          </h3>
          <p className="text-gray-500">
            开始对话，体验AI的智能回复
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <div key={message.id}>
            {message.role === 'user' ? (
              <UserMessage message={message} />
            ) : (
              <AssistantMessage 
                message={message}
                isStreaming={message.id === streamingMessageId}
              />
            )}
          </div>
        ))
      )}
      
      {/* 加载指示器 */}
      {isLoading && !streamingMessageId && (
        <TypingIndicator />
      )}
    </div>
  );
}
```

### 用户消息组件

#### UserMessage组件
```typescript
// app/components/UserMessage.tsx
import React from 'react';
import { Message } from '@/app/types';

interface UserMessageProps {
  message: Message;
}

export default function UserMessage({ message }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="max-w-xs lg:max-w-md">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-md">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
        <div className="flex justify-end mt-1">
          <span className="text-xs text-gray-400">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}
```

### AI消息组件

#### AssistantMessage组件
```typescript
// app/components/AssistantMessage.tsx
import React from 'react';
import { Message } from '@/app/types';

interface AssistantMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export default function AssistantMessage({ 
  message, 
  isStreaming = false 
}: AssistantMessageProps) {
  return (
    <div className="flex justify-start">
      <div className="max-w-xs lg:max-w-md">
        {/* AI头像 */}
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">🤖</span>
          </div>
          
          <div className="flex-1">
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-md border border-gray-100">
              <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                {message.content}
                {/* 流式输入光标 */}
                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse" />
                )}
              </p>
            </div>
            
            <div className="flex justify-start mt-1">
              <span className="text-xs text-gray-400">
                {isStreaming ? (
                  <span className="flex items-center">
                    <span className="animate-pulse">AI正在输入</span>
                    <span className="ml-1">...</span>
                  </span>
                ) : (
                  new Date(message.timestamp).toLocaleTimeString()
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 聊天输入组件

#### ChatInput组件
```typescript
// app/components/ChatInput.tsx
import React, { useState, useRef, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "输入消息..." 
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 发送消息
  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
      
      // 重置文本框高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // 键盘事件处理
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 自动调整高度
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // 自动调整文本框高度
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  return (
    <div className="border-t bg-white px-4 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end space-x-3">
          {/* 输入框 */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          
          {/* 发送按钮 */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {disabled ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        
        {/* 提示文字 */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          按 Enter 发送，Shift + Enter 换行
        </div>
      </div>
    </div>
  );
}
```

## 🔧 实践指导

### 响应式设计优化

#### 移动端适配
```css
/* globals.css */
@media (max-width: 768px) {
  .chat-container {
    padding: 0.5rem;
  }
  
  .message-bubble {
    max-width: 85%;
  }
  
  .chat-input {
    padding: 1rem;
  }
}
```

### 性能优化技巧

#### 消息虚拟化（可选）
```typescript
// 对于大量历史消息的虚拟化显示
import { FixedSizeList as List } from 'react-window';

const VirtualizedMessageList = ({ messages }: { messages: Message[] }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      {messages[index].role === 'user' ? (
        <UserMessage message={messages[index]} />
      ) : (
        <AssistantMessage message={messages[index]} />
      )}
    </div>
  );

  return (
    <List
      height={600}
      itemCount={messages.length}
      itemSize={100}
    >
      {Row}
    </List>
  );
};
```

## 📋 知识点总结

- **现代UI设计**：响应式、用户友好的聊天界面
- **状态管理**：完整的前端状态管理系统
- **实时交互**：流式消息显示和实时反馈
- **组件化架构**：可维护的React组件设计
- **用户体验**：自动滚动、输入提示、加载状态

## 🚀 下一步展望

完成了前端聊天界面的实现后，我们将学习6.4小节的流式响应前端实现，深入了解如何处理前端的流式数据接收、解析和显示，让我们的聊天体验更加流畅自然。
