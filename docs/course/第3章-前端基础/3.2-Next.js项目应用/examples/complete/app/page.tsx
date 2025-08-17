/**
 * 3.2 Next.js项目应用 - 主聊天页面组件
 * 
 * 这是我们AI聊天应用的核心页面，展示了Next.js中客户端组件的完整实现。
 * 
 * 🎯 学习要点：
 * 1. 'use client' 指令的使用 - 声明这是一个客户端组件
 * 2. React Hooks在Next.js中的应用 - useState、useEffect、useRef
 * 3. 状态管理 - 消息列表、加载状态、用户输入
 * 4. API调用 - 与Next.js API Routes的交互
 * 5. 流式响应处理 - AI应用的关键特性
 * 6. 事件处理 - 用户交互和键盘事件
 * 7. 组件组织 - 合理的组件拆分和复用
 */

'use client' // 📌 关键：声明这是客户端组件，支持状态管理和用户交互

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, MessageCircle, Zap } from 'lucide-react'

/**
 * 消息数据结构定义
 * 
 * 💡 设计思路：
 * - id: 唯一标识，用于React的key属性
 * - content: 消息内容
 * - role: 区分用户消息和AI消息
 * - timestamp: 显示消息时间
 * - isStreaming: 标识是否正在流式接收（AI消息专用）
 */
interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  isStreaming?: boolean
}

/**
 * 主聊天页面组件
 * 
 * 🏗️ 架构设计：
 * 1. 状态管理层：管理消息、输入、加载状态
 * 2. 用户交互层：处理输入、发送、键盘事件
 * 3. API通信层：与后端API进行数据交互
 * 4. 渲染层：展示消息列表和输入界面
 */
export default function ChatPage() {
  // 🎯 状态管理 - React Hooks的经典应用
  
  /**
   * 消息列表状态
   * 初始化时包含一条欢迎消息，展示AI助手的友好形象
   */
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '你好！我是由 LangGraphJS 驱动的 AI 助手。✨ 我可以帮助你解答问题、提供建议或者进行有趣的对话。有什么我可以帮助你的吗？',
      role: 'assistant',
      timestamp: new Date()
    }
  ])
  
  /**
   * 用户输入状态
   * 双向绑定到输入框，实时更新
   */
  const [input, setInput] = useState('')
  
  /**
   * 加载状态
   * 防止重复发送，提供用户反馈
   */
  const [isLoading, setIsLoading] = useState(false)
  
  // 🎯 DOM引用 - useRef的实际应用
  
  /**
   * 消息列表底部引用
   * 用于实现自动滚动到最新消息
   */
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  /**
   * 输入框引用
   * 用于实现自动调整高度等高级功能
   */
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 🎯 副作用处理 - useEffect的实际应用
  
  /**
   * 自动滚动效果
   * 每当消息列表更新时，自动滚动到底部
   * 
   * 💡 用户体验考虑：
   * - 流畅的动画效果
   * - 不干扰用户的阅读体验
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages]) // 依赖数组：当messages变化时触发

  /**
   * 输入框自动调整高度
   * 
   * 💡 用户体验优化：
   * - 支持多行输入
   * - 自动调整高度，最大120px
   * - 避免不必要的滚动条
   */
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }

  // 🎯 核心业务逻辑 - 消息发送和流式响应处理
  
  /**
   * 发送消息函数
   * 
   * 🔄 完整流程：
   * 1. 参数验证 - 防止发送空消息或重复发送
   * 2. 创建用户消息 - 立即显示用户输入
   * 3. 调用API接口 - 发送到后端处理
   * 4. 处理流式响应 - 逐字显示AI回复
   * 5. 错误处理 - 提供用户友好的错误提示
   * 6. 状态清理 - 重置加载状态和输入框
   */
  const sendMessage = async () => {
    // 🛡️ 参数验证
    if (!input.trim() || isLoading) return

    // 📝 创建用户消息对象
    const userMessage: Message = {
      id: Date.now().toString(), // 简单的ID生成策略
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    }

    // 🔄 状态更新
    setMessages(prev => [...prev, userMessage]) // 立即显示用户消息
    setInput('')        // 清空输入框
    setIsLoading(true)  // 显示加载状态

    try {
      // 🌐 API调用 - 使用fetch发送POST请求
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: input.trim(), 
          thread_id: 'demo-session-1' // 会话ID，用于区分不同对话
        })
      })

      // 🛡️ 错误检查
      if (!response.ok) {
        throw new Error('网络请求失败')
      }

      // 🤖 创建AI消息对象（初始为空，将通过流式响应填充）
      const assistantMessageId = (Date.now() + 1).toString()
      const assistantMessage: Message = {
        id: assistantMessageId,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        isStreaming: true // 标记为流式接收状态
      }

      setMessages(prev => [...prev, assistantMessage])

      // 🌊 流式响应处理 - AI应用的核心特性
      
      /**
       * 流式响应的优势：
       * 1. 用户体验：像真人对话一样逐字显示
       * 2. 感知性能：减少等待时间，提供即时反馈
       * 3. 技术优势：支持长文本生成，避免超时
       */
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法读取响应流')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      // 📖 逐块读取流式数据
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // 🔄 数据解码和缓冲处理
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留不完整的行

        // 🎯 逐行处理JSON数据
        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line)
              
              // 📝 处理文本块
              if (data.type === 'chunk' && data.content) {
                setMessages(prev => prev.map(msg =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: msg.content + data.content }
                    : msg
                ))
              } 
              // 🏁 处理结束信号
              else if (data.type === 'end') {
                setMessages(prev => prev.map(msg =>
                  msg.id === assistantMessageId
                    ? { ...msg, isStreaming: false }
                    : msg
                ))
                break
              } 
              // ❌ 处理错误信息
              else if (data.type === 'error') {
                throw new Error(data.message || '服务器错误')
              }
            } catch (parseError) {
              console.error('解析流数据错误:', parseError)
            }
          }
        }
      }

    } catch (error) {
      // 🛡️ 错误处理 - 用户友好的错误提示
      console.error('发送消息时出错:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，发送消息时出现错误。请稍后重试。',
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      // 🔄 状态清理
      setIsLoading(false)
    }
  }

  // 🎯 事件处理函数
  
  /**
   * 键盘事件处理
   * 
   * 💡 用户体验设计：
   * - Enter键发送消息（符合用户习惯）
   * - Shift+Enter换行（支持多行输入）
   * - 防止默认行为，避免表单提交
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  /**
   * 输入框变化处理
   * 
   * 🔄 功能组合：
   * - 更新输入状态
   * - 自动调整输入框高度
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    adjustTextareaHeight()
  }

  // 🎨 组件渲染 - JSX的最佳实践
  
  /**
   * 渲染结构说明：
   * 1. 外层容器：全屏布局，渐变背景
   * 2. 背景装饰：点阵和动态光效
   * 3. 头部导航：应用标题和状态指示
   * 4. 消息区域：消息列表和滚动处理
   * 5. 输入区域：消息输入和发送控制
   */
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      
      {/* 🎨 背景装饰效果 */}
      <div className="absolute inset-0 opacity-20">
        {/* 点阵背景 */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(156,146,172,0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      {/* 动态光效 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* 📱 头部导航栏 */}
      <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20 p-4 flex-shrink-0 w-full">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            
            {/* 左侧：应用标识 */}
            <div className="flex items-center gap-3">
              <div className="relative">
                {/* 应用图标 */}
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                {/* 在线状态指示 */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              
              {/* 应用信息 */}
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  LangGraph AI 助手
                  <Zap className="h-4 w-4 text-yellow-400" />
                </h1>
                <p className="text-purple-200 text-xs">智能对话 • 实时响应 • 无限可能</p>
              </div>
            </div>
            
            {/* 右侧：技术标签 */}
            <div className="flex items-center gap-2">
              {/* AI模型标签 */}
              <div className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                qwen-plus
              </div>
              
              {/* 技术架构标签 */}
              <div className="px-2 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs">
                🚀 StateGraph
              </div>
              
              {/* 流式响应标签 */}
              <div className="px-2 py-1 bg-gradient-to-r from-pink-500/20 to-orange-500/20 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs">
                ⚡ 流式
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 📨 主内容区域 */}
      <div className="relative z-10 flex-1 max-w-4xl mx-auto w-full flex flex-col p-4 min-h-0">
        
        {/* 💬 消息列表区域 */}
        <div className="flex-1 backdrop-blur-md bg-white/5 rounded-3xl border border-white/20 shadow-2xl overflow-hidden mb-4 min-h-0">
          <div className="h-full overflow-y-auto p-6 space-y-4 custom-scrollbar">
            
            {/* 🔄 消息渲染循环 */}
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-4 opacity-0 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                style={{
                  animation: `fadeIn 0.5s ease-out ${index * 0.1}s forwards` // 渐入动画
                }}
              >
                {/* 👤 用户头像 */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                      : 'bg-gradient-to-br from-purple-500 to-pink-500'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-5 w-5 text-white" />
                    ) : (
                      <Bot className="h-5 w-5 text-white" />
                    )}
                  </div>
                </div>

                {/* 💭 消息内容 */}
                <div className={`max-w-[75%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`relative inline-block p-4 rounded-2xl shadow-lg backdrop-blur-sm border ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500/90 to-cyan-500/90 text-white border-white/20 rounded-br-md'
                      : 'bg-white/10 text-white border-white/20 rounded-bl-md'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                    {/* ⌨️ 流式打字光标效果 */}
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-5 bg-white ml-1 typing-cursor"></span>
                    )}
                  </div>

                  {/* 🕐 消息时间戳 */}
                  <div className={`mt-2 text-xs text-purple-200 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {message.timestamp.toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* 🔄 加载动画 */}
            {isLoading && (
              <div className="flex gap-4 opacity-0" style={{ animation: 'fadeIn 0.5s ease-out forwards' }}>
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl rounded-bl-md p-4 shadow-lg">
                  <div className="flex items-center gap-2">
                    {/* 跳动的小圆点 */}
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-purple-200 text-xs ml-2">AI 正在思考...</span>
                  </div>
                </div>
              </div>
            )}

            {/* 📍 滚动锚点 */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ✏️ 输入区域 */}
        <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 shadow-2xl p-4 flex-shrink-0">
          <div className="flex items-end gap-4">
            
            {/* 📝 文本输入框 */}
            <div className="flex-1 relative input-focus-effect">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="输入你的消息... (支持 Shift+Enter 换行)"
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-200 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm transition-all duration-200 text-sm input-scrollbar"
                rows={1}
                disabled={isLoading}
                style={{ maxHeight: '120px' }}
              />
            </div>

            {/* 🚀 发送按钮 */}
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="group p-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:from-purple-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <Send className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* 📋 输入提示和状态指示 */}
          <div className="flex items-center justify-between mt-3 text-xs text-purple-200">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-3 w-3" />
              <span>按 Enter 发送，Shift+Enter 换行</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>实时连接</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 🎓 学习总结
 * 
 * 通过这个完整的聊天页面组件，你学到了：
 * 
 * 1. Next.js客户端组件的完整实现
 * 2. React Hooks在实际项目中的应用
 * 3. 状态管理的最佳实践
 * 4. 流式响应的处理方法
 * 5. 用户体验的优化技巧
 * 6. 错误处理和边界情况的考虑
 * 7. 组件设计的原则和方法
 * 
 * 🚀 进一步学习方向：
 * - 添加消息存储和历史记录功能
 * - 实现多用户聊天和实时同步
 * - 集成更多AI功能（语音、图像等）
 * - 优化性能和添加缓存机制
 * - 实现离线支持和PWA功能
 */


