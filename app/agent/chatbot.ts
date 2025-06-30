import '../utils/loadEnv'
import { StateGraph, START, END, MessagesAnnotation } from '@langchain/langgraph'
import { ChatOpenAI } from '@langchain/openai'
import { AIMessage } from '@langchain/core/messages'

// 创建聊天模型实例
const createChatModel = () => {
    return new ChatOpenAI({
        modelName: process.env.OPENAI_MODEL_NAME || 'gpt-3.5-turbo',
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
        openAIApiKey: process.env.OPENAI_API_KEY,
    })
}

// 定义聊天节点
async function chatbotNode(state: typeof MessagesAnnotation.State) {
    try {
        const model = createChatModel()
        const messages = state.messages

        // 调用语言模型
        const response = await model.invoke(messages)

        return {
            messages: [response]
        }
    } catch (error) {
        console.error('LLM 调用失败:', error)

        // 返回错误消息
        return {
            messages: [new AIMessage('抱歉，我现在无法处理你的请求。请稍后重试。')]
        }
    }
}

// 创建聊天图
export function createChatbotGraph() {
    const workflow = new StateGraph(MessagesAnnotation)
        .addNode('chatbot', chatbotNode)
        .addEdge(START, 'chatbot')
        .addEdge('chatbot', END)

    return workflow.compile()
}

// 导出编译后的图实例
export const chatbotGraph = createChatbotGraph() 