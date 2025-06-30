import { tool } from '@langchain/core/tools'
import { z } from 'zod'

// 计算器工具
export const calculator = tool(
    async ({ expression }: { expression: string }) => {
        try {
            // 简单的数学表达式计算（生产环境中应使用更安全的方法）
            const result = Function(`"use strict"; return (${expression})`)()
            return `计算结果: ${expression} = ${result}`
        } catch (error) {
            return `计算错误: 无法计算表达式 "${expression}"`
        }
    },
    {
        name: 'calculator',
        description: '计算数学表达式',
        schema: z.object({
            expression: z.string().describe('要计算的数学表达式，例如 "2 + 3 * 4"')
        })
    }
)

// 天气查询工具（模拟）
export const weatherTool = tool(
    async ({ city }: { city: string }) => {
        // 模拟天气数据
        const weatherData = {
            '北京': { temp: '15°C', condition: '晴天', humidity: '45%' },
            '上海': { temp: '18°C', condition: '多云', humidity: '60%' },
            '广州': { temp: '25°C', condition: '小雨', humidity: '80%' },
            '深圳': { temp: '26°C', condition: '晴天', humidity: '55%' },
            '杭州': { temp: '20°C', condition: '多云', humidity: '65%' },
            '成都': { temp: '18°C', condition: '阴天', humidity: '70%' }
        }

        const weather = weatherData[city as keyof typeof weatherData] || {
            temp: '20°C',
            condition: '未知',
            humidity: '50%'
        }

        return `${city}的天气情况：\n🌡️ 温度：${weather.temp}\n☁️ 天气：${weather.condition}\n💧 湿度：${weather.humidity}`
    },
    {
        name: 'weather',
        description: '查询指定城市的天气信息',
        schema: z.object({
            city: z.string().describe('要查询天气的城市名称')
        })
    }
)

// 时间工具
export const timeTool = tool(
    async () => {
        const now = new Date()
        return `当前时间: ${now.toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            weekday: 'long'
        })}`
    },
    {
        name: 'current_time',
        description: '获取当前时间和日期',
        schema: z.object({})
    }
)

// 搜索工具（模拟）
export const searchTool = tool(
    async ({ query }: { query: string }) => {
        // 模拟搜索结果
        const searchResults = [
            `关于 "${query}" 的搜索结果：`,
            `1. ${query} 相关的最新信息...`,
            `2. ${query} 的详细解释和说明...`,
            `3. ${query} 的相关链接和资源...`,
            `\n💡 这是一个模拟的搜索功能，在实际应用中可以接入真实的搜索API。`
        ]

        return searchResults.join('\n')
    },
    {
        name: 'search',
        description: '搜索相关信息',
        schema: z.object({
            query: z.string().describe('搜索查询词')
        })
    }
)

// 导出所有工具
export const allTools = [calculator, weatherTool, timeTool, searchTool]

// 工具映射，便于查找
export const toolsMap = {
    calculator,
    weather: weatherTool,
    current_time: timeTool,
    search: searchTool
} 