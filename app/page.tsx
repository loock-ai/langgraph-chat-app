'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, MessageCircle, Zap } from 'lucide-react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  isStreaming?: boolean
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '你好！我是由 LangGraphJS 驱动的 AI 助手。✨ 我可以帮助你解答问题、提供建议或者进行有趣的对话。有什么我可以帮助你的吗？',
      role: 'assistant',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: input.trim() })
      })

      if (!response.ok) {
        throw new Error('网络请求失败')
      }

      const assistantMessageId = (Date.now() + 1).toString()
      const assistantMessage: Message = {
        id: assistantMessageId,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        isStreaming: true
      }

      setMessages(prev => [...prev, assistantMessage])

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法读取响应流')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line)

              if (data.type === 'chunk' && data.content) {
                setMessages(prev => prev.map(msg =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: msg.content + data.content }
                    : msg
                ))
              } else if (data.type === 'end') {
                setMessages(prev => prev.map(msg =>
                  msg.id === assistantMessageId
                    ? { ...msg, isStreaming: false }
                    : msg
                ))
                break
              } else if (data.type === 'error') {
                throw new Error(data.message || '服务器错误')
              }
            } catch (parseError) {
              console.error('解析流数据错误:', parseError)
            }
          }
        }
      }

    } catch (error) {
      console.error('发送消息时出错:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，发送消息时出现错误。请稍后重试。',
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    adjustTextareaHeight()
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* 背景点阵 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(156,146,172,0.15) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      {/* 动态光效 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"
          style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"
          style={{ animationDelay: '4s' }}></div>
      </div>

      {/* 主容器 */}
      <div className="relative z-10 h-full flex flex-col">
        {/* 头部 */}
        <header className="backdrop-blur-md bg-white/10 border-b border-white/20 p-4 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              {/* 左侧：图标和标题 */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
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
                <div className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  qwen-plus
                </div>
                <div className="px-2 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs">
                  🚀 StateGraph
                </div>
                <div className="px-2 py-1 bg-gradient-to-r from-pink-500/20 to-orange-500/20 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs">
                  ⚡ 流式
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 聊天区域 */}
        <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col p-4 min-h-0">
          {/* 消息列表 */}
          <div className="flex-1 backdrop-blur-md bg-white/5 rounded-3xl border border-white/20 shadow-2xl overflow-hidden mb-4 min-h-0">
            <div className="h-full overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-4 opacity-0 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  style={{
                    animation: `fadeIn 0.5s ease-out ${index * 0.1}s forwards`
                  }}
                >
                  {/* 头像 */}
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${message.role === 'user'
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

                  {/* 消息内容 */}
                  <div className={`max-w-[75%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`relative inline-block p-4 rounded-2xl shadow-lg backdrop-blur-sm border ${message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500/90 to-cyan-500/90 text-white border-white/20 rounded-br-md'
                      : 'bg-white/10 text-white border-white/20 rounded-bl-md'
                      }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                      {/* 流式打字光标 */}
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-5 bg-white ml-1 typing-cursor"></span>
                      )}
                    </div>

                    <div className={`mt-2 text-xs text-purple-200 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {message.timestamp.toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {/* 加载动画 */}
              {isLoading && (
                <div className="flex gap-4 opacity-0" style={{ animation: 'fadeIn 0.5s ease-out forwards' }}>
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl rounded-bl-md p-4 shadow-lg">
                    <div className="flex items-center gap-2">
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

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 输入区域 */}
          <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 shadow-2xl p-4 flex-shrink-0">
            <div className="flex items-end gap-4">
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

              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="group p-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:from-purple-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                <Send className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </div>

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
    </div>
  )
}
