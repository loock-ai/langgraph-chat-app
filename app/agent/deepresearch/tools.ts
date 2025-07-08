import { TavilySearch } from '@langchain/tavily';
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { RunnableConfig } from '@langchain/core/runnables';
import {
  createSearchLLM,
  createAnalysisLLM,
  createGenerationLLM,
} from './nodes/llm';

// 工具配置接口
export interface ToolsConfig {
  tavily?: {
    maxResults?: number;
    searchDepth?: 'basic' | 'advanced';
    includeAnswer?: boolean;
  };
  mcp?: {
    enableSequentialThinking?: boolean;
    enableFilesystem?: boolean;
    allowedDirectories?: string[];
    customServers?: Record<
      string,
      {
        command: string;
        args: string[];
        transport: 'stdio';
      }
    >;
  };
}

// 统一的工具初始化函数
export async function initializeTools(config?: RunnableConfig) {
  const toolsConfig: ToolsConfig = config?.configurable?.toolsConfig || {};

  // 初始化搜索工具
  const tavilyConfig = toolsConfig.tavily || {};
  const searchTool = new TavilySearch({
    maxResults: tavilyConfig.maxResults || 5,
    searchDepth: tavilyConfig.searchDepth || 'advanced',
    includeAnswer: tavilyConfig.includeAnswer !== false,
  });

  // 初始化 MCP 工具
  const mcpConfig = toolsConfig.mcp || {};
  const mcpServers: Record<string, any> = {};

  // 添加 sequential-thinking 服务器
  if (mcpConfig.enableSequentialThinking !== false) {
    mcpServers['server-sequential-thinking'] = {
      command: 'npx',
      args: ['@modelcontextprotocol/server-sequential-thinking', '-y'],
      transport: 'stdio',
    };
  }

  // 添加 filesystem 服务器
  if (mcpConfig.enableFilesystem !== false) {
    const allowedDirs = mcpConfig.allowedDirectories || [process.cwd()];
    mcpServers['filesystem'] = {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', ...allowedDirs],
      transport: 'stdio',
    };
  }

  // 添加自定义服务器
  if (mcpConfig.customServers) {
    Object.assign(mcpServers, mcpConfig.customServers);
  }

  let mcpTools: any[] = [];
  if (Object.keys(mcpServers).length > 0) {
    const mcpClient = new MultiServerMCPClient({ mcpServers });
    mcpTools = await mcpClient.getTools();
  }

  return {
    searchTool,
    mcpTools,
    allTools: [searchTool, ...mcpTools],
  };
}

// 保留向后兼容的函数
export function getToolsConfig(config?: RunnableConfig): ToolsConfig {
  return config?.configurable?.toolsConfig || {};
}

export async function initializeMCPTools(toolsConfig: ToolsConfig) {
  const mcpConfig = toolsConfig.mcp || {};
  const mcpServers: Record<string, any> = {};

  if (mcpConfig.enableSequentialThinking !== false) {
    mcpServers['server-sequential-thinking'] = {
      command: 'npx',
      args: ['@modelcontextprotocol/server-sequential-thinking', '-y'],
      transport: 'stdio',
    };
  }

  if (mcpConfig.enableFilesystem !== false) {
    const allowedDirs = mcpConfig.allowedDirectories || [process.cwd()];
    mcpServers['filesystem'] = {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', ...allowedDirs],
      transport: 'stdio',
    };
  }

  if (mcpConfig.customServers) {
    Object.assign(mcpServers, mcpConfig.customServers);
  }

  if (Object.keys(mcpServers).length === 0) {
    return [];
  }

  const mcptools = new MultiServerMCPClient({ mcpServers });
  return await mcptools.getTools();
}

export function initializeSearchTool(toolsConfig: ToolsConfig) {
  const tavilyConfig = toolsConfig.tavily || {};

  return new TavilySearch({
    maxResults: tavilyConfig.maxResults || 5,
    searchDepth: tavilyConfig.searchDepth || 'advanced',
    includeAnswer: tavilyConfig.includeAnswer !== false,
  });
}

// 创建搜索专用的 ReactAgent
export async function createSearchAgent() {
  const llm = createSearchLLM();

  const searchTool = new TavilySearch({
    maxResults: 5,
    searchDepth: 'advanced',
    includeAnswer: true,
  });

  const mcptools = new MultiServerMCPClient({
    mcpServers: {
      'server-sequential-thinking': {
        command: 'npx',
        args: ['@modelcontextprotocol/server-sequential-thinking', '-y'],
        transport: 'stdio',
      },
    },
  });

  const tools = await mcptools.getTools();

  const searchPrompt = `你是一个专业的信息搜索助手。你的任务是：

1. 理解用户的搜索需求
2. 制定有效的搜索策略
3. 执行搜索并获取相关信息
4. 对搜索结果进行初步筛选和整理

请根据用户提供的章节标题和描述，搜索相关的高质量信息。
优先搜索权威来源、学术资料、官方文档等可靠信息。

搜索完成后，请提供：
- 搜索查询词
- 搜索结果摘要
- 关键信息点
- 信息来源评估`;

  return createReactAgent({
    llm,
    tools: [searchTool, ...tools],
    prompt: searchPrompt,
  });
}

// 创建分析专用的 ReactAgent
export async function createAnalysisAgent() {
  const llm = createAnalysisLLM();

  const mcptools = new MultiServerMCPClient({
    mcpServers: {
      'server-sequential-thinking': {
        command: 'npx',
        args: ['@modelcontextprotocol/server-sequential-thinking', '-y'],
        transport: 'stdio',
      },
    },
  });

  const tools = await mcptools.getTools();

  const analysisPrompt = `你是一个专业的信息分析师。你的任务是：

1. 深入分析提供的搜索结果和信息
2. 提取关键信息和核心观点
3. 识别重要的数据、事实和趋势
4. 评估信息的可靠性和相关性
5. 生成结构化的分析报告

分析时请注意：
- 区分事实和观点
- 识别权威来源
- 提取量化数据
- 发现内在联系和模式
- 评估信息的时效性

请使用sequential-thinking工具进行深度思考和分析。`;

  return createReactAgent({
    llm,
    tools: [...tools],
    prompt: analysisPrompt,
  });
}

// 创建内容生成专用的 ReactAgent
export async function createContentGenerationAgent() {
  const llm = createGenerationLLM();

  const mcptools = new MultiServerMCPClient({
    mcpServers: {
      'server-sequential-thinking': {
        command: 'npx',
        args: ['@modelcontextprotocol/server-sequential-thinking', '-y'],
        transport: 'stdio',
      },
      filesystem: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', process.cwd()],
        transport: 'stdio',
      },
    },
  });

  const tools = await mcptools.getTools();

  const generationPrompt = `你是一个专业的内容创作专家。你的任务是：

1. 基于分析结果生成高质量的研究内容
2. 确保内容结构清晰、逻辑严密
3. 使用适当的Markdown格式
4. 包含必要的引用和参考
5. 保持内容的学术性和专业性

内容生成要求：
- 使用清晰的标题层级（H2, H3, H4）
- 包含具体的数据和事实
- 提供相关的引用来源
- 逻辑连贯，论证充分
- 语言准确，表达清晰

请使用sequential-thinking工具进行深度思考，确保生成的内容质量。`;

  return createReactAgent({
    llm,
    tools: [...tools],
    prompt: generationPrompt,
  });
}

// 创建统一的章节研究 ReactAgent
export async function createSectionResearchAgent() {
  const llm = createAnalysisLLM();

  const searchTool = new TavilySearch({
    maxResults: 8,
    searchDepth: 'advanced',
    includeAnswer: true,
  });

  const mcptools = new MultiServerMCPClient({
    mcpServers: {
      'server-sequential-thinking': {
        command: 'npx',
        args: ['@modelcontextprotocol/server-sequential-thinking', '-y'],
        transport: 'stdio',
      },
      filesystem: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', process.cwd()],
        transport: 'stdio',
      },
    },
  });

  const tools = await mcptools.getTools();

  const researchPrompt = `你是一个专业的研究专家，能够完成完整的章节研究工作。你的能力包括：

**信息搜索能力**：
- 制定有效的搜索策略
- 执行多轮搜索获取全面信息
- 筛选和评估信息质量
- 识别权威来源和可靠数据

**深度分析能力**：
- 使用sequential-thinking工具进行深度思考
- 提取关键信息和核心观点
- 发现内在联系和模式
- 评估信息的可靠性和时效性

**内容创作能力**：
- 生成结构化的高质量内容
- 使用适当的Markdown格式
- 包含具体数据和引用来源
- 确保逻辑清晰、论证充分

工作流程：
1. 首先使用搜索工具获取相关信息
2. 然后使用sequential-thinking工具进行深度分析
3. 最后基于分析结果生成完整的章节内容

请确保每个步骤都充分完成，生成的内容具有学术性和专业性。`;

  return createReactAgent({
    llm,
    tools: [searchTool, ...tools],
    prompt: researchPrompt,
  });
}

// 辅助函数：提取关键点
export function extractKeyPoints(content: string): string[] {
  const lines = content.split('\n');
  return lines
    .filter(
      (line) => line.includes('•') || line.includes('-') || line.includes('*')
    )
    .map((line) => line.replace(/[•\-*]\s*/, '').trim())
    .filter((line) => line.length > 10)
    .slice(0, 10);
}

// 辅助函数：提取洞察
export function extractInsights(content: string): string[] {
  const insightKeywords = ['洞察', '发现', '趋势', '模式', '关键', '重要'];
  const lines = content.split('\n');
  return lines
    .filter((line) => insightKeywords.some((keyword) => line.includes(keyword)))
    .map((line) => line.trim())
    .filter((line) => line.length > 20)
    .slice(0, 5);
}

// 辅助函数：提取来源
export function extractSources(content: string): string[] {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = content.match(urlRegex) || [];
  return [...new Set(urls)].slice(0, 10);
}
