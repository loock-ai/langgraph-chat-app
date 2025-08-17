/**
 * 3.2 Next.js项目应用 - 聊天API接口
 * 
 * 这是Next.js API Routes的核心示例，展示了如何创建RESTful API接口。
 * 
 * 🎯 学习要点：
 * 1. API Routes的文件命名和组织方式
 * 2. HTTP方法处理（GET、POST等）
 * 3. 请求数据获取和验证
 * 4. 流式响应实现 - AI应用的关键特性
 * 5. 错误处理和状态码管理
 * 6. TypeScript在API开发中的应用
 * 7. 性能优化和缓存策略
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * POST请求处理 - 发送聊天消息
 * 
 * 🔄 API设计原则：
 * 1. RESTful规范：POST用于创建资源（发送消息）
 * 2. 数据验证：确保输入参数的有效性
 * 3. 错误处理：提供清晰的错误信息和状态码
 * 4. 流式响应：支持实时数据传输
 * 5. 类型安全：使用TypeScript确保类型正确性
 * 
 * 📡 请求格式：
 * ```json
 * {
 *   "message": "用户输入的消息内容",
 *   "thread_id": "会话唯一标识符"
 * }
 * ```
 * 
 * 📤 响应格式（流式）：
 * ```
 * {"type":"chunk","content":"第"}
 * {"type":"chunk","content":"一"}
 * {"type":"chunk","content":"个"}
 * {"type":"chunk","content":"字"}
 * {"type":"end"}
 * ```
 */
export async function POST(request: NextRequest) {
    try {
        // 🔍 Step 1: 获取和解析请求数据
        const body = await request.json()
        const { message, thread_id } = body

        // 📊 请求日志（开发环境）
        if (process.env.NODE_ENV === 'development') {
            console.log('📨 收到聊天请求:', {
                message: message?.substring(0, 50) + (message?.length > 50 ? '...' : ''),
                thread_id,
                timestamp: new Date().toISOString()
            })
        }

        // 🛡️ Step 2: 参数验证
        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                {
                    error: '消息内容不能为空且必须为字符串类型',
                    code: 'INVALID_MESSAGE'
                },
                { status: 400 }
            )
        }

        if (!thread_id || typeof thread_id !== 'string') {
            return NextResponse.json(
                {
                    error: '会话ID不能为空且必须为字符串类型',
                    code: 'INVALID_THREAD_ID'
                },
                { status: 400 }
            )
        }

        // 🧹 消息内容清理和验证
        const cleanMessage = message.trim()
        if (cleanMessage.length === 0) {
            return NextResponse.json(
                {
                    error: '消息内容不能为空',
                    code: 'EMPTY_MESSAGE'
                },
                { status: 400 }
            )
        }

        if (cleanMessage.length > 4000) {
            return NextResponse.json(
                {
                    error: '消息长度不能超过4000字符',
                    code: 'MESSAGE_TOO_LONG'
                },
                { status: 400 }
            )
        }

        // 🌊 Step 3: 创建流式响应
        /**
         * 流式响应的核心优势：
         * 1. 用户体验：提供即时反馈，减少等待感
         * 2. 性能优化：分块传输，降低内存占用
         * 3. 错误处理：可以在流过程中处理错误
         * 4. 可扩展性：支持长时间运行的任务
         */
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // 📝 生成模拟AI响应
                    const aiResponse = await generateAIResponse(cleanMessage, thread_id)

                    // 🎯 逐字符发送响应（模拟AI打字效果）
                    for (let i = 0; i < aiResponse.length; i++) {
                        const chunk = {
                            type: 'chunk',
                            content: aiResponse[i],
                            timestamp: Date.now(),
                            position: i
                        }

                        // 📤 发送数据块
                        controller.enqueue(
                            new TextEncoder().encode(JSON.stringify(chunk) + '\n')
                        )

                        // ⏱️ 模拟AI思考时间（不同字符不同延迟）
                        const delay = getTypingDelay(aiResponse[i])
                        await new Promise(resolve => setTimeout(resolve, delay))
                    }

                    // 🏁 发送结束信号
                    const endChunk = {
                        type: 'end',
                        timestamp: Date.now(),
                        total_chars: aiResponse.length
                    }

                    controller.enqueue(
                        new TextEncoder().encode(JSON.stringify(endChunk) + '\n')
                    )

                    // ✅ 关闭流
                    controller.close()

                    // 📊 成功日志
                    if (process.env.NODE_ENV === 'development') {
                        console.log('✅ 聊天响应完成:', {
                            thread_id,
                            response_length: aiResponse.length,
                            timestamp: new Date().toISOString()
                        })
                    }

                } catch (error) {
                    // ❌ 流处理错误
                    console.error('流式响应处理错误:', error)

                    // 发送错误信息到客户端
                    const errorChunk = {
                        type: 'error',
                        message: error instanceof Error ? error.message : '未知错误',
                        timestamp: Date.now()
                    }

                    try {
                        controller.enqueue(
                            new TextEncoder().encode(JSON.stringify(errorChunk) + '\n')
                        )
                    } catch (enqueueError) {
                        console.error('发送错误信息失败:', enqueueError)
                    }

                    controller.error(error)
                }
            }
        })

        // 📡 返回流式响应
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no', // 禁用Nginx缓冲
            }
        })

    } catch (error) {
        // 🛡️ 全局错误处理
        console.error('聊天API错误:', error)

        // 返回结构化错误响应
        return NextResponse.json(
            {
                error: '服务器内部错误，请稍后重试',
                code: 'INTERNAL_SERVER_ERROR',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        )
    }
}

/**
 * GET请求处理 - 获取聊天历史
 * 
 * 🔍 API设计说明：
 * 1. 查询参数：通过URL参数传递会话ID
 * 2. 数据格式：返回标准化的历史记录格式
 * 3. 分页支持：支持大量历史记录的分页查询
 * 4. 缓存策略：合理的缓存设置提升性能
 * 
 * 📡 请求格式：
 * ```
 * GET /api/chat?thread_id=session-123&limit=50&offset=0
 * ```
 * 
 * 📤 响应格式：
 * ```json
 * {
 *   "thread_id": "session-123",
 *   "history": [...],
 *   "total": 100,
 *   "has_more": true
 * }
 * ```
 */
export async function GET(request: NextRequest) {
    try {
        // 🔍 获取查询参数
        const { searchParams } = new URL(request.url)
        const threadId = searchParams.get('thread_id')
        const limit = parseInt(searchParams.get('limit') || '50', 10)
        const offset = parseInt(searchParams.get('offset') || '0', 10)

        // 📊 请求日志
        if (process.env.NODE_ENV === 'development') {
            console.log('📖 获取历史记录请求:', {
                thread_id: threadId,
                limit,
                offset,
                timestamp: new Date().toISOString()
            })
        }

        // 🛡️ 参数验证
        if (!threadId) {
            return NextResponse.json(
                {
                    error: '会话ID不能为空',
                    code: 'MISSING_THREAD_ID'
                },
                { status: 400 }
            )
        }

        if (limit < 1 || limit > 100) {
            return NextResponse.json(
                {
                    error: '数量限制必须在1-100之间',
                    code: 'INVALID_LIMIT'
                },
                { status: 400 }
            )
        }

        if (offset < 0) {
            return NextResponse.json(
                {
                    error: '偏移量不能为负数',
                    code: 'INVALID_OFFSET'
                },
                { status: 400 }
            )
        }

        // 📚 获取历史记录（模拟数据）
        const historyData = await getChatHistory(threadId, limit, offset)

        // 📤 返回成功响应
        return NextResponse.json(
            {
                thread_id: threadId,
                history: historyData.messages,
                total: historyData.total,
                has_more: historyData.hasMore,
                limit,
                offset,
                timestamp: new Date().toISOString()
            },
            {
                headers: {
                    'Cache-Control': 'private, max-age=60', // 缓存1分钟
                }
            }
        )

    } catch (error) {
        console.error('获取历史记录API错误:', error)

        return NextResponse.json(
            {
                error: '获取历史记录失败',
                code: 'FETCH_HISTORY_ERROR',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        )
    }
}

// 🤖 辅助函数：生成AI响应

/**
 * 生成模拟AI响应
 * 
 * 💡 实现说明：
 * 在第5章中，这里将被替换为真正的LangGraphJS集成
 * 当前提供模拟响应，展示API接口的完整流程
 */
async function generateAIResponse(message: string, threadId: string): Promise<string> {
    // 🎯 基于用户消息生成不同类型的响应

    if (message.toLowerCase().includes('你好') || message.toLowerCase().includes('hello')) {
        return `你好！很高兴和你对话。我是基于 Next.js API Routes 构建的 AI 助手。

你刚才说："${message}"

我可以帮助你：
• 回答各种问题
• 进行有趣的对话  
• 提供建议和信息
• 协助解决问题

在第5章中，我将被升级为真正的 LangGraphJS 驱动的智能助手！🚀

有什么我可以帮助你的吗？`
    }

    if (message.toLowerCase().includes('技术') || message.toLowerCase().includes('开发')) {
        return `关于技术开发，这是一个很好的话题！

你提到："${message}"

我们当前使用的技术栈包括：
• Next.js 15 - 全栈React框架
• TypeScript - 类型安全的JavaScript
• API Routes - 服务端接口开发
• 流式响应 - 实时数据传输

这个API接口展示了：
✅ RESTful设计原则
✅ 数据验证和错误处理
✅ 流式响应实现
✅ TypeScript类型安全
✅ 性能优化策略

想了解哪个方面的更多细节？`
    }

    if (message.toLowerCase().includes('帮助') || message.toLowerCase().includes('help')) {
        return `当然很乐意帮助你！

你的问题："${message}"

我是一个演示性的AI助手，目前基于Next.js API Routes构建。我可以：

🎯 功能特性：
• 实时对话交互
• 流式响应显示
• 多轮对话记忆
• 错误处理和恢复

🔧 技术特点：
• TypeScript类型安全
• RESTful API设计
• 流式数据传输
• 性能优化

💡 学习价值：
• Next.js API开发
• 流式响应实现
• 错误处理最佳实践
• 用户体验优化

请告诉我你想了解什么，或者直接开始聊天吧！`
    }

    // 🎨 默认响应模板
    return `感谢你的消息！

你说："${message}"

这是一个基于 Next.js API Routes 的响应示例。我通过以下步骤处理你的消息：

1️⃣ 接收并验证输入参数
2️⃣ 清理和检查消息内容
3️⃣ 生成个性化的AI响应
4️⃣ 通过流式传输逐字返回
5️⃣ 提供完整的用户体验

当前我是一个演示版本，在第5章中将集成真正的LangGraphJS功能，届时我将变得更加智能和强大！

继续和我聊天，体验流式响应的效果吧！✨`
}

/**
 * 获取聊天历史记录（模拟实现）
 */
async function getChatHistory(threadId: string, limit: number, offset: number) {
    // 🗄️ 模拟历史记录数据
    const mockHistory = [
        {
            id: 'welcome',
            kwargs: {
                content: '你好！我是由 LangGraphJS 驱动的 AI 助手。✨ 我可以帮助你解答问题、提供建议或者进行有趣的对话。有什么我可以帮助你的吗？'
            },
            id: ['AIMessage', 'welcome'],
            timestamp: new Date(Date.now() - 60000).toISOString()
        }
    ]

    // 📊 分页处理
    const startIndex = offset
    const endIndex = offset + limit
    const paginatedHistory = mockHistory.slice(startIndex, endIndex)

    return {
        messages: paginatedHistory,
        total: mockHistory.length,
        hasMore: endIndex < mockHistory.length
    }
}

/**
 * 计算打字延迟（模拟真实打字效果）
 */
function getTypingDelay(char: string): number {
    // 🎭 不同字符的打字延迟模拟
    if (char === ' ') return 50   // 空格稍快
    if (char === '\n') return 100 // 换行稍慢
    if (char === '。' || char === '！' || char === '？') return 200 // 标点停顿
    if (char === '，' || char === '、') return 100 // 逗号短停

    // 📊 基础字符延迟，增加随机性模拟真实打字
    const baseDelay = 30
    const randomVariation = Math.random() * 20 - 10 // ±10ms随机变化

    return Math.max(10, baseDelay + randomVariation)
}

/**
 * 🎓 学习总结
 * 
 * 通过这个API接口实现，你学到了：
 * 
 * 1. Next.js API Routes的完整开发流程
 * 2. RESTful API设计的最佳实践
 * 3. 流式响应的实现方法和应用场景
 * 4. 数据验证和错误处理策略
 * 5. TypeScript在后端开发中的应用
 * 6. 性能优化和缓存策略
 * 7. 用户体验优化的技术实现
 * 
 * 🔄 与前端组件的配合：
 * - 前端发送POST请求到这个API
 * - API返回流式响应，前端逐字显示
 * - 完整的前后端交互流程
 * 
 * 🚀 第5章的升级预告：
 * - generateAIResponse将被LangGraphJS替换
 * - 添加真正的AI理解和生成能力
 * - 支持更复杂的对话管理
 * - 集成外部AI服务和工具
 */


