# LangGraph 聊天应用

这是一个使用 Next.js 和 LangGraphJS 构建的智能聊天应用。应用集成了 OpenAI 的语言模型，通过 LangGraph 提供结构化的对话流程。

## 📋 前置要求

- Node.js 18.0 或更高版本
- pnpm（推荐）或 npm
- OpenAI API 密钥

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd langgraph-chat-app
```

### 2. 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 3. 环境配置

**重要：** 项目需要创建 `app/utils/.env` 文件才能正常启动：

```bash
# 创建目录（如果不存在）
mkdir -p app/utils

# 创建 app/utils/.env 文件
touch app/utils/.env
```

在 `app/utils/.env` 文件中添加以下内容：

```bash
# app/utils/.env
# OpenAI API 密钥（必需）
OPENAI_API_KEY=your_openai_api_key_here

# 可选配置（有默认值，可以不设置）
OPENAI_MODEL_NAME=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=1000
```

### 4. 获取 OpenAI API 密钥

1. 访问 [OpenAI 平台](https://platform.openai.com/)
2. 创建账户并登录
3. 导航到 API 密钥页面
4. 创建新的 API 密钥
5. 将密钥复制到 `app/utils/.env` 文件中

### 5. 启动开发服务器

```bash
# 使用 pnpm（推荐）
pnpm dev

# 或使用其他包管理器
npm run dev
# 或
yarn dev
# 或
bun dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 启动。

## 🔧 项目结构

```
langgraph-chat-app/
├── app/
│   ├── agent/               # LangGraph 代理逻辑
│   │   ├── chatbot.ts       # 聊天机器人图定义
│   │   ├── tools.ts         # 工具函数
│   │   └── index.ts         # 导出文件
│   ├── api/
│   │   └── chat/
│   │       └── route.ts     # 聊天 API 路由
│   ├── utils/
│   │   ├── loadEnv.ts       # 环境变量加载器
│   │   └── .env             # 🚨 必需的环境配置文件
│   ├── page.tsx             # 主聊天页面
│   └── layout.tsx           # 应用布局
├── package.json
└── README.md
```

## ⚠️ 故障排除

### 常见启动问题

1. **应用无法启动 / 环境变量错误**
   - 确保已创建 `app/utils/.env` 文件
   - 检查文件中的 API 密钥是否正确

2. **API 调用失败**
   - 验证 OpenAI API 密钥是否有效
   - 检查网络连接
   - 确认 API 额度是否充足

3. **依赖安装问题**
   ```bash
   # 清除缓存并重新安装
   pnpm store prune
   pnpm install
   ```

## 🔗 相关链接

- [Next.js 文档](https://nextjs.org/docs)
- [LangGraphJS 文档](https://langchain-ai.github.io/langgraphjs/)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [详细设置指南](./SETUP.md)

## 📝 开发说明

编辑 `app/page.tsx` 开始开发。页面会随着文件的修改自动更新。

此项目使用 [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) 来自动优化和加载字体。

## 🚀 部署

推荐使用 [Vercel 平台](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) 来部署 Next.js 应用。

查看 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying) 了解更多详情。
