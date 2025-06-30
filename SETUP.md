# LangGraph 聊天应用设置指南

## 概述

这是一个使用 Next.js 和 LangGraphJS 构建的智能聊天应用。应用集成了 OpenAI 的语言模型，通过 LangGraph 提供结构化的对话流程。

## 环境配置

### 1. 创建环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
# OpenAI API 配置
OPENAI_API_KEY=your_openai_api_key_here

# 可选配置
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=1000
```

### 2. 获取 OpenAI API 密钥

1. 访问 [OpenAI 官网](https://platform.openai.com/)
2. 创建账户并登录
3. 导航到 API 密钥页面
4. 创建新的 API 密钥
5. 将密钥复制到 `.env.local` 文件中

## 安装和运行

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

应用将在 `http://localhost:3000` 启动。

### 3. 测试聊天功能

1. 打开浏览器访问 `http://localhost:3000`
2. 在聊天界面中输入消息
3. 享受与 AI 助手的对话

## 功能特性

- **现代化 UI**：使用 Tailwind CSS 构建的响应式聊天界面
- **LangGraph 驱动**：使用 LangGraphJS 管理对话流程
- **实时对话**：支持实时消息发送和接收
- **错误处理**：完善的错误处理和用户反馈
- **TypeScript 支持**：完整的类型安全

## 技术栈

- **前端**：Next.js 15, React 19, TypeScript
- **样式**：Tailwind CSS
- **AI 框架**：LangGraphJS, LangChain
- **LLM**：OpenAI GPT-3.5-turbo
- **包管理**：pnpm

## 项目结构

```
langgraph-chat-app/
├── app/
│   ├── agent/               # LangGraph 代理逻辑
│   │   ├── chatbot.ts       # 基础聊天机器人图
│   │   ├── tools.ts         # 工具定义
│   │   └── index.ts         # 导出文件
│   ├── api/chat/route.ts    # 聊天 API 路由
│   ├── page.tsx             # 主聊天页面
│   └── layout.tsx           # 应用布局
├── package.json
├── tsconfig.json
└── SETUP.md                 # 本文件
```

## 开发说明

### API 路由

聊天功能通过 `/api/chat` 端点提供：

- `POST /api/chat`：发送消息并获取 AI 响应
- `GET /api/chat`：获取 API 状态信息

### LangGraph 配置

应用采用模块化架构设计：

#### 📁 `app/agent/` 目录
- **`chatbot.ts`**: 定义基础聊天机器人的图结构
  - 图流程：**START** → **chatbot** → **END**
  - chatbot 节点处理用户消息并调用 OpenAI API
  
- **`tools.ts`**: 定义各种工具函数
  - 🧮 计算器工具
  - 🌤️ 天气查询工具
  - ⏰ 时间查询工具
  - 🔍 搜索工具
  
- **`index.ts`**: 统一导出接口

#### 📁 `app/api/chat/` 目录
- API 路由调用 `app/agent` 中定义的图
- 处理 HTTP 请求/响应
- 错误处理和状态管理

### 自定义和扩展

你可以轻松扩展应用功能：

1. **添加工具调用**：在 LangGraph 中集成外部工具
2. **多轮对话**：添加对话历史管理
3. **用户认证**：集成身份验证系统
4. **数据持久化**：添加数据库存储

## 故障排除

### 常见问题

1. **API 密钥错误**：确保 `.env.local` 文件中的 OpenAI API 密钥正确
2. **网络问题**：检查网络连接和防火墙设置
3. **模块错误**：运行 `pnpm install` 重新安装依赖

### 开发工具

- 使用浏览器开发者工具查看网络请求
- 检查服务器控制台输出了解错误信息
- 使用 TypeScript 编译器检查类型错误

## 许可证

本项目仅供学习和演示使用。 