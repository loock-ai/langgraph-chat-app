// 简单的聊天机器人
export { chatbotGraph, createChatbotGraph } from './chatbot'

// 工具定义
export { allTools, calculator, weatherTool, timeTool, searchTool } from './tools'

// 辅助函数
export function formatMessagesForAgent(messages: any[]) {
    return messages.map(msg => {
        if (msg.role === 'user') {
            return { content: msg.content, type: 'human' }
        } else if (msg.role === 'assistant') {
            return { content: msg.content, type: 'ai' }
        }
        return msg
    })
} 