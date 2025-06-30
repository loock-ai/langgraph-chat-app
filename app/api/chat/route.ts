import '../../utils/loadEnv'
import { NextRequest, NextResponse } from 'next/server'
import { HumanMessage } from '@langchain/core/messages'
import { ChatOpenAI } from '@langchain/openai'

export async function POST(request: NextRequest) {
    try {
        const { message } = await request.json()

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { error: '无效的消息格式' },
                { status: 400 }
            )
        }

        // 创建消息对象
        const userMessage = new HumanMessage(message)

        // 创建流式响应
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // 直接使用ChatOpenAI的流式功能
                    const model = new ChatOpenAI({
                        modelName: process.env.OPENAI_MODEL_NAME || 'gpt-3.5-turbo',
                        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
                        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
                        openAIApiKey: process.env.OPENAI_API_KEY,
                        streaming: true,
                    })

                    // 使用流式调用
                    const streamResult = await model.stream([userMessage])

                    for await (const chunk of streamResult) {
                        console.log('OpenAI chunk:', chunk)

                        const content = chunk.content
                        if (typeof content === 'string' && content) {
                            // 发送流式数据
                            const data = JSON.stringify({
                                type: 'chunk',
                                content: content
                            }) + '\n'

                            controller.enqueue(new TextEncoder().encode(data))
                        }
                    }

                    // 发送结束标记
                    const endData = JSON.stringify({
                        type: 'end',
                        status: 'success'
                    }) + '\n'

                    controller.enqueue(new TextEncoder().encode(endData))
                    controller.close()

                } catch (error) {
                    console.error('流式聊天错误:', error)

                    const errorData = JSON.stringify({
                        type: 'error',
                        error: '服务器内部错误',
                        message: '抱歉，处理你的请求时出现了问题。请稍后重试。'
                    }) + '\n'

                    controller.enqueue(new TextEncoder().encode(errorData))
                    controller.close()
                }
            }
        })

        // 返回流式响应
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        })

    } catch (error) {
        console.error('聊天 API 错误:', error)

        return NextResponse.json(
            {
                error: '服务器内部错误',
                response: '抱歉，处理你的请求时出现了问题。请稍后重试。'
            },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'LangGraph 聊天 API 正在运行',
        version: '1.0.0',
        endpoints: {
            chat: 'POST /api/chat (流式响应)'
        }
    })
} 