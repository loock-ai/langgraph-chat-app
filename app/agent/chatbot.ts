import '../utils/loadEnv';
import {
    StateGraph,
    MessagesAnnotation,
    START,
    END,
} from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import path from 'path';



// 初始化 OpenAI 模型
const model = new ChatOpenAI({
    model: process.env.OPENAI_MODEL_NAME,
    temperature: 0.7,
    streaming: true, // 启用流式响应
});

// 聊天节点：处理用户输入并生成回复
async function chatbotNode(state: typeof MessagesAnnotation.State) {
    const response = await model.invoke(state.messages);
    return { messages: [response] };
}

// 创建检查点保存器
// const checkpointer = new MemorySaver();

// 构建流式聊天机器人图
const workflow = new StateGraph(MessagesAnnotation)
    .addNode('chatbot', chatbotNode)
    .addEdge(START, 'chatbot')
    .addEdge('chatbot', END);



const getApp = () => {
    const dbPath = path.resolve(process.cwd(), 'chat_history2.db')
    console.log("dbPath", SqliteSaver)
    const checkpointer = SqliteSaver.fromConnString(dbPath);
    return workflow.compile({ checkpointer });
}

const app = getApp()

// 流式响应示例
async function runStreamingChatbot() {
    console.log('=== 流式聊天机器人示例 ===');

    const threadConfig = { configurable: { thread_id: 'streaming-demo' + Math.random() } };

    console.log('\n--- 流式响应演示 ---');
    console.log('用户: 请详细介绍一下 React 的核心概念');
    console.log('AI: ', { newline: false });

    // 使用 streamEvents 获取流式响应
    for await (const event of app.streamEvents(
        {
            messages: [new HumanMessage('你是谁？')],
        },
        { version: 'v2', ...threadConfig }
    )) {
        // 过滤 LLM 流式输出事件
        if (event.event === 'on_chat_model_stream') {
            const chunk = event.data?.chunk;
            if (chunk?.content) {
                process.stdout.write(chunk.content);
            }
        }
    }

    console.log('\n\n--- 另一个流式响应 ---');
    console.log('用户: 能给我一些学习建议吗？');
    console.log('AI: ', { newline: false });

    for await (const event of app.streamEvents(
        {
            messages: [new HumanMessage('能给我一些学习建议吗？')],
        },
        { version: 'v2', ...threadConfig }
    )) {
        if (event.event === 'on_chat_model_stream') {
            const chunk = event.data?.chunk;
            if (chunk?.content) {
                process.stdout.write(chunk.content);
            }
        }
    }

    console.log('\n');
}

// 流式状态更新示例
async function runStreamingStates() {
    console.log('\n=== 流式状态更新示例 ===');

    const threadConfig = { configurable: { thread_id: 'state-streaming' } };

    console.log('\n--- 监听状态变化 ---');

    // 使用 stream 方法获取每步的状态更新
    const stream = await app.stream(
        {
            messages: [new HumanMessage('你好，请介绍一下自己')],
        },
        { streamMode: 'updates', ...threadConfig }
    );

    for await (const chunk of stream) {
        console.log('状态更新:', JSON.stringify(chunk, null, 2));
    }
}

// 自定义流式处理器
class StreamingHandler {
    private buffer: string = '';
    private onToken?: (token: string) => void;
    private onComplete?: (fullResponse: string) => void;

    constructor(options: {
        onToken?: (token: string) => void;
        onComplete?: (fullResponse: string) => void;
    }) {
        this.onToken = options.onToken;
        this.onComplete = options.onComplete;
    }

    async handleStream(
        graph: typeof app,
        input: { messages: any[] },
        config: any
    ) {
        this.buffer = '';

        for await (const event of graph.streamEvents(input, {
            version: 'v2',
            ...config,
        })) {
            if (event.event === 'on_chat_model_stream') {
                const chunk = event.data?.chunk;
                if (chunk?.content) {
                    this.buffer += chunk.content;
                    this.onToken?.(chunk.content);
                }
            }
        }

        this.onComplete?.(this.buffer);
        return this.buffer;
    }
}

// 使用自定义流式处理器的示例
async function runCustomStreamingHandler() {
    console.log('\n=== 自定义流式处理器示例 ===');

    const threadConfig = { configurable: { thread_id: 'custom-streaming' } };

    const handler = new StreamingHandler({
        onToken: (token) => {
            process.stdout.write(token);
        },
        onComplete: (fullResponse) => {
            console.log(`\n\n[完整响应长度: ${fullResponse.length} 字符]`);
        },
    });

    console.log('\n用户: 请解释一下什么是状态管理');
    console.log('AI: ');

    await handler.handleStream(
        app,
        {
            messages: [new HumanMessage('请解释一下什么是状态管理')],
        },
        threadConfig
    );
}

// 批量流式处理示例
async function runBatchStreaming() {
    console.log('\n=== 批量流式处理示例 ===');

    const questions = ['什么是组件？', '什么是 Props？', '什么是 State？'];

    for (let i = 0; i < questions.length; i++) {
        const threadConfig = { configurable: { thread_id: `batch-${i}` } };

        console.log(`\n--- 问题 ${i + 1}: ${questions[i]} ---`);
        console.log('AI: ');

        for await (const event of app.streamEvents(
            {
                messages: [new HumanMessage(questions[i])],
            },
            { version: 'v2', ...threadConfig }
        )) {
            if (event.event === 'on_chat_model_stream') {
                const chunk = event.data?.chunk;
                if (chunk?.content) {
                    process.stdout.write(chunk.content);
                }
            }
        }

        console.log('\n');
    }
}

// 如果直接运行此文件
if (require.main === module) {
    async function main() {
        await runStreamingChatbot();
        // await runStreamingStates();
        // await runCustomStreamingHandler();
        // await runBatchStreaming();
    }

    main().catch(console.error);
}

export {
    app as streamingChatbot,
    runStreamingChatbot,
    runStreamingStates,
    StreamingHandler,
    runCustomStreamingHandler,
    runBatchStreaming,
};
