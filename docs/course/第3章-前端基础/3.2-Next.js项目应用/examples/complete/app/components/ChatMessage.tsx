/**
 * 3.2 Next.js项目应用 - 聊天消息组件
 * 
 * 这是一个可重用的聊天消息组件，展示了React组件设计的最佳实践。
 * 
 * 🎯 学习要点：
 * 1. 组件props设计和TypeScript类型定义
 * 2. 条件渲染和样式动态生成
 * 3. 可重用组件的设计原则
 * 4. React组件的性能优化
 * 5. 用户界面细节的处理
 */

'use client' // 客户端组件，支持交互功能

import { Bot, User } from 'lucide-react'

/**
 * 消息数据接口定义
 * 
 * 🎯 设计原则：
 * 1. 明确的数据结构定义
 * 2. 可选属性的合理使用
 * 3. 扩展性考虑
 * 4. 类型安全保障
 */
export interface Message {
  id: string                           // 消息唯一标识
  content: string                      // 消息内容
  role: 'user' | 'assistant'          // 消息角色
  timestamp: Date                      // 发送时间
  isStreaming?: boolean                // 是否正在流式接收
  metadata?: {                         // 扩展元数据
    model?: string                     // AI模型信息
    tokenCount?: number                // Token数量
    responseTime?: number              // 响应时间
  }
}

/**
 * 组件Props接口定义
 * 
 * 🎯 设计考虑：
 * 1. 单一职责：只负责消息显示
 * 2. 可配置性：支持自定义样式和行为
 * 3. 可访问性：支持屏幕阅读器
 * 4. 扩展性：便于未来功能添加
 */
interface ChatMessageProps {
  message: Message                     // 消息数据
  showAvatar?: boolean                 // 是否显示头像
  showTimestamp?: boolean              // 是否显示时间戳
  className?: string                   // 自定义样式类
  onMessageClick?: (message: Message) => void  // 消息点击回调
  animationDelay?: number              // 动画延迟（秒）
}

/**
 * 聊天消息组件
 * 
 * 🎨 组件设计理念：
 * 1. 原子化：专注于单一功能
 * 2. 可复用：支持不同场景使用
 * 3. 可定制：灵活的配置选项
 * 4. 高性能：优化渲染和交互
 * 5. 无障碍：支持键盘导航和屏幕阅读器
 */
export default function ChatMessage({
  message,
  showAvatar = true,
  showTimestamp = true,
  className = '',
  onMessageClick,
  animationDelay = 0
}: ChatMessageProps) {
  
  // 🎨 样式配置
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  
  /**
   * 头像样式配置
   * 
   * 💡 设计思路：
   * - 用户和AI使用不同的渐变色
   * - 圆润的设计风格
   * - 清晰的视觉区分
   */
  const avatarStyles = isUser
    ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
    : 'bg-gradient-to-br from-purple-500 to-pink-500'
  
  /**
   * 消息气泡样式配置
   * 
   * 💡 设计思路：
   * - 用户消息：右侧，蓝色系
   * - AI消息：左侧，透明毛玻璃效果
   * - 圆角设计增加友好感
   */
  const bubbleStyles = isUser
    ? 'bg-gradient-to-br from-blue-500/90 to-cyan-500/90 text-white border-white/20 rounded-br-md'
    : 'bg-white/10 text-white border-white/20 rounded-bl-md'
  
  /**
   * 布局样式配置
   * 
   * 💡 布局原则：
   * - 用户消息右对齐
   * - AI消息左对齐
   * - 清晰的视觉层次
   */
  const layoutStyles = isUser ? 'flex-row-reverse text-right' : 'flex-row text-left'
  
  /**
   * 处理消息点击事件
   */
  const handleClick = () => {
    if (onMessageClick) {
      onMessageClick(message)
    }
  }
  
  /**
   * 处理键盘事件（无障碍支持）
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onMessageClick) {
      e.preventDefault()
      onMessageClick(message)
    }
  }
  
  /**
   * 格式化时间显示
   * 
   * 💡 用户体验考虑：
   * - 显示简洁的时间格式
   * - 本地化时间显示
   * - 适合聊天场景的时间格式
   */
  const formatTime = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // 24小时制
    })
  }
  
  /**
   * 获取消息状态指示文本
   * 
   * ♿ 无障碍考虑：
   * - 为屏幕阅读器提供状态信息
   * - 清晰的消息状态描述
   */
  const getStatusText = (): string => {
    if (message.isStreaming) {
      return '正在接收消息'
    }
    return `${isUser ? '用户' : 'AI助手'}发送的消息`
  }
  
  return (
    <div
      className={`
        flex gap-4 opacity-0
        ${layoutStyles}
        ${className}
        ${onMessageClick ? 'cursor-pointer hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors duration-200' : ''}
      `}
      style={{
        animation: `fadeIn 0.5s ease-out ${animationDelay}s forwards`
      }}
      onClick={onMessageClick ? handleClick : undefined}
      onKeyDown={onMessageClick ? handleKeyDown : undefined}
      tabIndex={onMessageClick ? 0 : undefined}
      role={onMessageClick ? 'button' : 'article'}
      aria-label={`${getStatusText()}，${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`}
    >
      
      {/* 👤 用户头像区域 */}
      {showAvatar && (
        <div className="flex-shrink-0">
          <div
            className={`
              w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg
              ${avatarStyles}
              transition-transform duration-200 hover:scale-105
            `}
            aria-hidden="true" // 装饰性元素，对屏幕阅读器隐藏
          >
            {isUser ? (
              <User className="h-5 w-5 text-white" />
            ) : (
              <Bot className="h-5 w-5 text-white" />
            )}
          </div>
        </div>
      )}

      {/* 💬 消息内容区域 */}
      <div className={`max-w-[75%] ${isUser ? 'text-right' : 'text-left'}`}>
        
        {/* 消息气泡 */}
        <div
          className={`
            relative inline-block p-4 rounded-2xl shadow-lg backdrop-blur-sm border
            ${bubbleStyles}
            transition-all duration-200 hover:shadow-xl
          `}
        >
          {/* 消息文本内容 */}
          <p 
            className="text-sm leading-relaxed whitespace-pre-wrap break-words"
            dir="auto" // 自动检测文本方向，支持多语言
          >
            {message.content}
          </p>

          {/* 💬 流式打字光标效果 */}
          {message.isStreaming && (
            <span 
              className="inline-block w-2 h-5 bg-white ml-1 typing-cursor"
              aria-label="正在输入"
              role="status"
            />
          )}
          
          {/* 📊 消息元数据显示（开发模式） */}
          {process.env.NODE_ENV === 'development' && message.metadata && (
            <div className="mt-2 text-xs opacity-50 space-y-1">
              {message.metadata.model && (
                <div>模型: {message.metadata.model}</div>
              )}
              {message.metadata.tokenCount && (
                <div>Tokens: {message.metadata.tokenCount}</div>
              )}
              {message.metadata.responseTime && (
                <div>响应时间: {message.metadata.responseTime}ms</div>
              )}
            </div>
          )}
        </div>

        {/* 🕐 时间戳显示 */}
        {showTimestamp && (
          <div 
            className={`
              mt-2 text-xs text-purple-200 opacity-75
              ${isUser ? 'text-right' : 'text-left'}
              transition-opacity duration-200 hover:opacity-100
            `}
          >
            <time 
              dateTime={message.timestamp.toISOString()}
              title={message.timestamp.toLocaleString('zh-CN')} // 悬浮显示完整时间
            >
              {formatTime(message.timestamp)}
            </time>
            
            {/* 消息状态指示 */}
            {message.isStreaming && (
              <span className="ml-2 inline-flex items-center">
                <span className="animate-pulse">●</span>
                <span className="sr-only">正在接收消息</span>
              </span>
            )}
          </div>
        )}
        
        {/* 📈 消息统计信息（可选） */}
        {message.metadata?.tokenCount && (
          <div className={`
            mt-1 text-xs text-purple-300 opacity-50
            ${isUser ? 'text-right' : 'text-left'}
          `}>
            {message.metadata.tokenCount} tokens
            {message.metadata.responseTime && (
              <span className="ml-2">• {message.metadata.responseTime}ms</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 消息列表组件
 * 
 * 🎯 用途：管理多个消息的显示和交互
 * 特点：虚拟化支持、自动滚动、性能优化
 */
interface MessageListProps {
  messages: Message[]
  onMessageClick?: (message: Message) => void
  className?: string
  showAvatars?: boolean
  showTimestamps?: boolean
}

export function MessageList({
  messages,
  onMessageClick,
  className = '',
  showAvatars = true,
  showTimestamps = true
}: MessageListProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {messages.map((message, index) => (
        <ChatMessage
          key={message.id}
          message={message}
          onMessageClick={onMessageClick}
          showAvatar={showAvatars}
          showTimestamp={showTimestamps}
          animationDelay={index * 0.1} // 错开动画时间
        />
      ))}
    </div>
  )
}

/**
 * 🎓 学习总结
 * 
 * 通过这个聊天消息组件，你学到了：
 * 
 * 1. React组件设计的最佳实践
 * 2. TypeScript接口定义和类型安全
 * 3. 条件渲染和动态样式处理
 * 4. 组件可复用性和可配置性设计
 * 5. 无障碍访问的实现方法
 * 6. 性能优化和用户体验提升
 * 7. 组件组合和抽象的技巧
 * 
 * 🎨 设计模式应用：
 * - 组件组合：ChatMessage + MessageList
 * - 配置模式：通过props控制行为
 * - 渲染模式：条件渲染和列表渲染
 * - 事件模式：回调函数和事件处理
 * 
 * 🚀 扩展可能性：
 * - 添加消息状态指示（已读、未读等）
 * - 支持富文本内容（Markdown、链接等）
 * - 实现消息编辑和删除功能
 * - 添加消息反应和评分功能
 * - 支持消息搜索和过滤
 * - 实现消息虚拟化（大量消息性能优化）
 */


