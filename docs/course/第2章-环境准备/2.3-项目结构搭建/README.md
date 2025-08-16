# 2.3 项目结构搭建 🏗️

> 构建清晰优雅的代码架构

---

## 🎯 小节概述与学习目标

欢迎来到项目结构搭建的重要环节！经过前面的工具安装和项目初始化，你已经有了一个基本的Next.js项目。现在我们要将这个项目改造成一个符合最佳实践、可扩展、易维护的AI应用架构。

### 小节核心价值和重要性

想象一下，如果把软件项目比作一座城市，那么项目结构就是城市的规划图。好的城市规划让居民生活便利、交通顺畅、功能分区清晰；同样，好的项目结构让开发者工作高效、代码易懂、功能模块清晰。

这一小节的价值在于：
- **建立清晰的代码组织**：让每个文件都有明确的归属和职责
- **实现架构设计的落地**：将第一章学到的分层架构转化为实际的目录结构
- **提升开发效率**：规范的结构让团队协作更顺畅
- **保证代码质量**：通过工具和规范确保代码的一致性和可维护性

### 与前后小节的连接关系

**承接前面的基础**：
- 2.1节的开发工具为我们提供了强大的编辑和管理能力
- 2.2节的项目初始化给了我们一个基础的Next.js项目骨架
- 现在我们要在这个基础上建立专业的项目架构

**为后续开发铺路**：
- 2.4节的环境配置需要清晰的文件组织
- 第3章的前端开发需要组件和页面的目录结构
- 第4章的后端开发需要API和数据处理的模块组织

**实现理论的物理化**：
- 将第1章学到的四层架构转化为实际的目录结构
- 将抽象的设计原则体现在具体的文件组织中

### 具体的学习目标

学完这一小节，你将能够：

1. **设计符合最佳实践的项目目录结构**：理解每个目录的作用和组织原则
2. **建立代码质量保证体系**：配置ESLint、Prettier等工具确保代码规范
3. **创建可复用的组件和模块**：建立清晰的代码分层和复用机制
4. **配置开发规范和团队协作标准**：为团队开发建立统一的标准

### 本小节涉及的核心内容

我们今天要建立的项目结构：
- 📁 **目录架构设计**：基于分层架构的目录组织
- 🔧 **代码规范配置**：ESLint、Prettier、TypeScript配置
- 📦 **模块化设计**：组件、工具、类型的模块化组织
- 📋 **开发规范建立**：代码风格、命名约定、文档标准

---

## 📚 核心内容深度讲解

### 第一部分：目录架构设计 📁

好的项目结构就像一栋设计良好的大厦，每一层都有明确的功能，每个房间都有合理的用途。让我们从整体规划开始。

#### 基于分层架构的目录设计

还记得第1章我们学过的四层架构吗？现在我们要将它转化为实际的目录结构：

```
langgraph-chat-app/
├── app/                    # Next.js App Router（前端层 + API层）
│   ├── components/         # React组件（前端层）
│   ├── api/               # API路由（API层）
│   ├── utils/             # 工具函数（通用层）
│   ├── types/             # TypeScript类型定义
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局组件
│   └── page.tsx           # 首页组件
├── src/                   # 业务逻辑层
│   ├── agent/             # AI集成层
│   │   ├── chatbot.ts     # 聊天机器人核心
│   │   ├── config/        # AI配置
│   │   ├── tools/         # AI工具
│   │   └── index.ts       # 导出接口
│   ├── database/          # 数据层
│   │   ├── models/        # 数据模型
│   │   ├── migrations/    # 数据库迁移
│   │   └── index.ts       # 数据库连接
│   └── services/          # 业务服务层
│       ├── chat.ts        # 聊天服务
│       ├── session.ts     # 会话服务
│       └── index.ts       # 服务导出
├── docs/                  # 项目文档
├── public/                # 静态资源
├── tests/                 # 测试文件
└── 配置文件
```

**为什么这样设计目录结构？**

1. **符合分层架构**：
   ```
   app/components/     → 前端层（UI组件）
   app/api/           → API层（接口处理）
   src/agent/         → AI集成层（智能处理）
   src/database/      → 数据层（存储管理）
   src/services/      → 业务服务层（业务逻辑）
   ```

2. **职责分离清晰**：
   - 每个目录有明确的职责范围
   - 相似功能的代码组织在一起
   - 减少跨目录的依赖关系

3. **扩展性良好**：
   - 新功能可以按照既定模式添加
   - 不会破坏现有的组织结构
   - 支持大型项目的发展需求

#### 详细的目录结构说明

**app/ 目录（Next.js App Router）**：

```
app/
├── components/           # React组件库
│   ├── ui/              # 基础UI组件
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts     # 统一导出
│   ├── chat/            # 聊天相关组件
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   ├── MessageBubble.tsx
│   │   └── index.ts
│   ├── layout/          # 布局组件
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── index.ts
│   └── index.ts         # 总导出文件
├── api/                 # API路由
│   ├── chat/
│   │   ├── route.ts     # POST /api/chat
│   │   └── sessions/
│   │       └── route.ts # GET/POST /api/chat/sessions
│   └── health/
│       └── route.ts     # GET /api/health
├── utils/               # 工具函数
│   ├── constants.ts     # 常量定义
│   ├── helpers.ts       # 辅助函数
│   ├── formatters.ts    # 格式化函数
│   ├── validators.ts    # 验证函数
│   └── index.ts         # 统一导出
├── types/               # TypeScript类型
│   ├── chat.ts          # 聊天相关类型
│   ├── api.ts           # API相关类型
│   ├── database.ts      # 数据库相关类型
│   └── index.ts         # 类型导出
├── hooks/               # 自定义React Hooks
│   ├── useChat.ts
│   ├── useSession.ts
│   └── index.ts
└── styles/              # 样式文件
    ├── globals.css
    ├── components.css
    └── utilities.css
```

**src/ 目录（业务逻辑）**：

```
src/
├── agent/               # AI集成层
│   ├── chatbot.ts       # 核心聊天机器人
│   ├── config/          # AI配置
│   │   ├── models.ts    # 模型配置
│   │   ├── prompts.ts   # 提示词管理
│   │   └── tools.ts     # 工具配置
│   ├── workflows/       # LangGraph工作流
│   │   ├── chat.ts      # 聊天工作流
│   │   ├── analysis.ts  # 分析工作流
│   │   └── index.ts
│   ├── tools/           # AI工具
│   │   ├── calculator.ts
│   │   ├── search.ts
│   │   └── index.ts
│   └── index.ts         # AI服务导出
├── database/            # 数据层
│   ├── connection.ts    # 数据库连接
│   ├── models/          # 数据模型
│   │   ├── Session.ts
│   │   ├── Message.ts
│   │   └── index.ts
│   ├── repositories/    # 数据访问层
│   │   ├── SessionRepository.ts
│   │   ├── MessageRepository.ts
│   │   └── index.ts
│   ├── migrations/      # 数据库迁移
│   │   ├── 001_initial.sql
│   │   └── 002_add_indexes.sql
│   └── index.ts         # 数据库导出
└── services/            # 业务服务层
    ├── ChatService.ts   # 聊天业务逻辑
    ├── SessionService.ts # 会话管理
    ├── UserService.ts   # 用户管理
    └── index.ts         # 服务导出
```

#### 模块化导出策略

**统一导出模式**：

每个目录都有一个`index.ts`文件作为该模块的统一导出入口：

```typescript
// app/components/ui/index.ts
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Modal } from './Modal';
export type { ButtonProps, InputProps, ModalProps } from './types';

// app/components/index.ts
export * from './ui';
export * from './chat';
export * from './layout';

// 使用时可以这样导入：
import { Button, MessageList, Header } from '@/components';
```

**路径别名配置**：

在`tsconfig.json`中配置路径别名：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./app/*"],
      "@/components/*": ["./app/components/*"],
      "@/api/*": ["./app/api/*"],
      "@/utils/*": ["./app/utils/*"],
      "@/types/*": ["./app/types/*"],
      "@/agent/*": ["./src/agent/*"],
      "@/database/*": ["./src/database/*"],
      "@/services/*": ["./src/services/*"]
    }
  }
}
```

### 第二部分：代码规范配置 🔧

代码规范就像交通规则，让所有人都按照统一的标准工作，避免混乱和冲突。

#### ESLint配置：代码质量守护者

**创建ESLint配置文件**：

```javascript
// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "@typescript-eslint/recommended"
  ),
  {
    rules: {
      // TypeScript规则
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      
      // React规则
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/exhaustive-deps": "warn",
      
      // 通用规则
      "no-console": "warn",
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error",
      
      // 导入规则
      "import/order": [
        "error",
        {
          "groups": [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index"
          ],
          "newlines-between": "always",
          "pathGroups": [
            {
              "pattern": "@/**",
              "group": "internal",
              "position": "before"
            }
          ]
        }
      ]
    }
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "no-console": "off"
    }
  }
];

export default eslintConfig;
```

**安装必要的ESLint插件**：

```bash
pnpm add -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
pnpm add -D eslint-plugin-import eslint-plugin-react eslint-plugin-react-hooks
```

#### Prettier配置：代码格式化专家

**创建Prettier配置文件**：

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "importOrder": [
    "^react",
    "^next",
    "^@langchain",
    "^@/",
    "^[./]"
  ],
  "importOrderSeparation": true,
  "plugins": ["@trivago/prettier-plugin-sort-imports"]
}
```

**创建.prettierignore文件**：

```
# 构建输出
.next/
out/
build/
dist/

# 依赖
node_modules/

# 日志
*.log

# 数据库
*.db
*.sqlite

# 环境文件
.env*

# 生成的文件
*.generated.*
```

#### TypeScript配置优化

**更新tsconfig.json**：

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./app/*"],
      "@/components/*": ["./app/components/*"],
      "@/api/*": ["./app/api/*"],
      "@/utils/*": ["./app/utils/*"],
      "@/types/*": ["./app/types/*"],
      "@/hooks/*": ["./app/hooks/*"],
      "@/agent/*": ["./src/agent/*"],
      "@/database/*": ["./src/database/*"],
      "@/services/*": ["./src/services/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    ".next",
    "out",
    "dist"
  ]
}
```

#### VS Code工作区配置

**创建.vscode/settings.json**：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.tsx": "typescriptreact",
    "*.ts": "typescript"
  },
  "[typescript]": {
    "editor.tabSize": 2
  },
  "[typescriptreact]": {
    "editor.tabSize": 2
  },
  "[json]": {
    "editor.tabSize": 2
  }
}
```

**创建.vscode/extensions.json**（推荐插件）：

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag"
  ]
}
```

### 第三部分：基础文件和模块创建 📦

现在让我们创建一些基础的文件和模块，为后续的开发做好准备。

#### 类型定义文件

**app/types/index.ts**：

```typescript
// 基础类型定义
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 聊天相关类型
export interface Message extends BaseEntity {
  content: string;
  role: 'user' | 'assistant' | 'system';
  sessionId: string;
  metadata?: {
    tokens?: number;
    model?: string;
    temperature?: number;
  };
}

export interface Session extends BaseEntity {
  name: string;
  description?: string;
  isActive: boolean;
  messageCount: number;
}

// API相关类型
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
  };
}

export interface ChatResponse {
  message: Message;
  sessionId: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// UI组件类型
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends ComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export interface InputProps extends ComponentProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
}
```

#### 常量定义文件

**app/utils/constants.ts**：

```typescript
// API相关常量
export const API_ENDPOINTS = {
  CHAT: '/api/chat',
  SESSIONS: '/api/chat/sessions',
  HEALTH: '/api/health',
} as const;

// 应用配置常量
export const APP_CONFIG = {
  NAME: 'LangGraph Chat App',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-powered chat application built with LangGraphJS',
  MAX_MESSAGE_LENGTH: 4000,
  MAX_HISTORY_LENGTH: 50,
  DEFAULT_MODEL: 'qwen-plus',
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 2000,
} as const;

// UI相关常量
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 280,
  HEADER_HEIGHT: 64,
  MESSAGE_BUBBLE_MAX_WIDTH: 600,
  ANIMATION_DURATION: 200,
} as const;

// 颜色主题常量
export const COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#64748b',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#06b6d4',
} as const;

// 消息类型常量
export const MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
} as const;

// 错误消息常量
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  SERVER_ERROR: '服务器错误，请稍后重试',
  VALIDATION_ERROR: '输入内容不符合要求',
  UNAUTHORIZED: '访问被拒绝，请检查API密钥',
  RATE_LIMIT: '请求过于频繁，请稍后重试',
  UNKNOWN_ERROR: '未知错误，请联系技术支持',
} as const;
```

#### 工具函数文件

**app/utils/helpers.ts**：

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind CSS类名合并工具
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 生成唯一ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
}

// 格式化日期
export function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return date.toLocaleDateString('zh-CN');
}

// 格式化文件大小
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 深拷贝函数
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

// 安全的JSON解析
export function safeJsonParse<T>(str: string, fallback?: T): T | null {
  try {
    return JSON.parse(str);
  } catch {
    return fallback ?? null;
  }
}

// 检查是否为有效的URL
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

// 截断文本
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
```

#### 验证函数文件

**app/utils/validators.ts**：

```typescript
import { z } from 'zod';

// 基础验证规则
export const messageSchema = z.object({
  content: z
    .string()
    .min(1, '消息内容不能为空')
    .max(4000, '消息内容不能超过4000字符'),
  sessionId: z
    .string()
    .uuid('会话ID格式不正确')
    .optional(),
});

export const sessionSchema = z.object({
  name: z
    .string()
    .min(1, '会话名称不能为空')
    .max(100, '会话名称不能超过100字符'),
  description: z
    .string()
    .max(500, '会话描述不能超过500字符')
    .optional(),
});

export const chatRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  sessionId: z.string().uuid().optional(),
  options: z.object({
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().min(1).max(4000).optional(),
  }).optional(),
});

// 验证函数
export function validateMessage(data: unknown) {
  return messageSchema.safeParse(data);
}

export function validateSession(data: unknown) {
  return sessionSchema.safeParse(data);
}

export function validateChatRequest(data: unknown) {
  return chatRequestSchema.safeParse(data);
}

// 通用验证工具
export function isEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidApiKey(key: string): boolean {
  // OpenAI API密钥格式检查
  return /^sk-[A-Za-z0-9]{20,}$/.test(key);
}

export function isValidSessionId(id: string): boolean {
  // UUID v4格式检查
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
```

### 第四部分：脚本和自动化配置 📋

让我们配置一些有用的脚本和自动化工具，提升开发效率。

#### package.json脚本配置

**更新package.json的scripts部分**：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf .next out dist",
    "dev:clean": "pnpm clean && pnpm dev",
    "build:analyze": "ANALYZE=true pnpm build",
    "db:generate": "node scripts/generate-db.js",
    "db:migrate": "node scripts/migrate-db.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "prepare": "husky install"
  }
}
```

#### 创建有用的脚本

**scripts/generate-component.js**（组件生成脚本）：

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function generateComponent(componentName, directory = 'app/components') {
  const componentDir = path.join(process.cwd(), directory, componentName);
  
  // 创建组件目录
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }

  // 组件模板
  const componentTemplate = `interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
}

export default function ${componentName}({ 
  className,
  children 
}: ${componentName}Props) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
`;

  // 导出文件模板
  const indexTemplate = `export { default } from './${componentName}';
export type { ${componentName}Props } from './${componentName}';
`;

  // 写入文件
  fs.writeFileSync(
    path.join(componentDir, `${componentName}.tsx`),
    componentTemplate
  );
  
  fs.writeFileSync(
    path.join(componentDir, 'index.ts'),
    indexTemplate
  );

  console.log(`✅ 组件 ${componentName} 创建成功！`);
  console.log(`📁 位置: ${componentDir}`);
}

// 获取命令行参数
const componentName = process.argv[2];
const directory = process.argv[3];

if (!componentName) {
  console.error('❌ 请提供组件名称');
  console.log('用法: node scripts/generate-component.js ComponentName [directory]');
  process.exit(1);
}

generateComponent(componentName, directory);
```

**scripts/check-project.js**（项目检查脚本）：

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function checkProjectStructure() {
  console.log('🔍 检查项目结构...\n');

  const requiredDirs = [
    'app',
    'app/components',
    'app/api',
    'app/utils',
    'app/types',
    'src',
    'src/agent',
    'src/database',
    'src/services',
    'public',
    'docs'
  ];

  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'next.config.ts',
    'eslint.config.mjs',
    '.prettierrc',
    '.gitignore',
    'README.md'
  ];

  let allGood = true;

  // 检查必需的目录
  console.log('📁 检查目录结构:');
  requiredDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      console.log(`   ✅ ${dir}/`);
    } else {
      console.log(`   ❌ ${dir}/ (缺失)`);
      allGood = false;
    }
  });

  console.log('\n📄 检查配置文件:');
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} (缺失)`);
      allGood = false;
    }
  });

  // 检查依赖
  console.log('\n📦 检查关键依赖:');
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
    );
    
    const requiredDeps = [
      'next',
      'react',
      'typescript',
      '@langchain/langgraph',
      '@langchain/openai'
    ];

    requiredDeps.forEach(dep => {
      if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
        console.log(`   ✅ ${dep}`);
      } else {
        console.log(`   ❌ ${dep} (未安装)`);
        allGood = false;
      }
    });
  } catch (error) {
    console.log('   ❌ 无法读取package.json');
    allGood = false;
  }

  console.log('\n' + '='.repeat(50));
  if (allGood) {
    console.log('🎉 项目结构检查通过！所有必需文件和目录都存在。');
  } else {
    console.log('⚠️  项目结构检查发现问题，请根据上述提示进行修复。');
  }
  
  return allGood;
}

checkProjectStructure();
```

#### Git Hooks配置

**安装husky和lint-staged**：

```bash
pnpm add -D husky lint-staged
npx husky install
```

**创建.husky/pre-commit**：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**配置lint-staged（在package.json中）**：

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{js,jsx,json,css,md}": [
      "prettier --write"
    ]
  }
}
```

---

## 💻 实践指导

### 代码运行和测试方法

#### 项目结构验证

**运行项目检查脚本**：

```bash
# 给脚本执行权限
chmod +x scripts/check-project.js

# 运行检查
node scripts/check-project.js
```

**验证TypeScript配置**：

```bash
# 检查TypeScript配置
npx tsc --noEmit

# 检查路径别名是否工作
echo 'import { cn } from "@/utils";' > test-import.ts
npx tsc --noEmit test-import.ts
rm test-import.ts
```

**验证ESLint和Prettier配置**：

```bash
# 检查代码规范
pnpm lint

# 格式化代码
pnpm format

# 检查格式化是否正确
pnpm format:check
```

#### 组件生成测试

```bash
# 生成测试组件
node scripts/generate-component.js TestButton app/components/ui

# 检查生成的文件
ls -la app/components/ui/TestButton/
cat app/components/ui/TestButton/TestButton.tsx
```

#### 开发服务器测试

```bash
# 启动开发服务器
pnpm dev

# 在浏览器中访问 http://localhost:3000
# 检查是否正常启动，没有TypeScript错误
```

### 实际操作的具体步骤

#### 步骤1：创建目录结构

```bash
# 创建主要目录结构
mkdir -p app/{components/{ui,chat,layout},api/chat/sessions,utils,types,hooks,styles}
mkdir -p src/{agent/{config,workflows,tools},database/{models,repositories,migrations},services}
mkdir -p scripts tests docs

# 验证目录创建
tree app src -I node_modules
```

#### 步骤2：配置开发工具

```bash
# 安装代码质量工具
pnpm add -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
pnpm add -D prettier eslint-plugin-import eslint-plugin-react eslint-plugin-react-hooks
pnpm add -D husky lint-staged

# 安装工具库
pnpm add clsx tailwind-merge zod
pnpm add -D @types/node
```

#### 步骤3：创建配置文件

```bash
# 创建所有必要的配置文件
touch .prettierrc .prettierignore
touch eslint.config.mjs
mkdir -p .vscode
touch .vscode/settings.json .vscode/extensions.json
```

#### 步骤4：创建基础文件

```bash
# 创建基础模块文件
touch app/types/index.ts
touch app/utils/{constants.ts,helpers.ts,validators.ts,index.ts}
touch src/agent/index.ts
touch src/database/index.ts
touch src/services/index.ts

# 为每个模块创建导出文件
find app src -type d -exec touch {}/index.ts \;
```

#### 步骤5：验证配置

```bash
# 运行所有检查
pnpm type-check
pnpm lint
pnpm format:check

# 启动开发服务器测试
pnpm dev
```

### 问题解决的方法指导

#### 常见问题1：路径别名不工作

**症状**：TypeScript提示找不到`@/`开头的模块

**解决方案**：
```bash
# 检查tsconfig.json中的paths配置
# 确保baseUrl设置为"."
# 重启TypeScript服务器：在VS Code中按Ctrl+Shift+P，输入"TypeScript: Restart TS Server"
```

#### 常见问题2：ESLint配置冲突

**症状**：ESLint规则冲突或无法工作

**解决方案**：
```bash
# 清除ESLint缓存
npx eslint --cache-location ./node_modules/.cache/.eslintcache --cache --fix .

# 检查eslint配置
npx eslint --print-config app/page.tsx
```

#### 常见问题3：Prettier格式化不一致

**症状**：保存时格式化行为不一致

**解决方案**：
```bash
# 检查VS Code设置
# 确保设置了正确的默认格式化器
# 检查.prettierrc文件格式是否正确
npx prettier --check .
```

### 鼓励学员动手实践的话术

🎉 **恭喜你进入项目架构设计的实战阶段！**

现在你正在做的不仅仅是创建文件夹和文件，而是在为你的AI应用建立一个坚实而优雅的架构基础。每一个目录的创建，每一个配置的设置，都在为后续的开发工作铺平道路。

**你现在正在学习的技能**：
- ✅ **专业的项目组织能力**：这是高级开发者的必备技能
- ✅ **代码质量保证思维**：通过工具和规范确保代码质量
- ✅ **团队协作标准建立**：为团队开发建立统一标准
- ✅ **可维护代码的写法**：为长期项目成功奠定基础

**实践建议**：
1. **理解每个配置的作用**：不要只是复制粘贴，要理解为什么这样配置
2. **实验和调整**：尝试修改配置，看看会发生什么变化
3. **建立自己的标准**：基于项目需求建立适合的标准
4. **记录和分享**：把学到的经验记录下来，与他人分享

记住：**好的架构是成功项目的基石！**你现在投入的时间和精力，会在后续的开发中得到百倍的回报！

继续加油！🚀

---

## 📋 知识点总结回顾

### 本节课核心知识点清单

#### 🏗️ 项目架构设计精华

**分层目录结构**：
- **app/目录**：Next.js App Router + 前端组件 + API路由
- **src/目录**：业务逻辑 + AI集成 + 数据处理 + 服务层
- **配置文件**：开发工具配置 + 代码规范 + 构建配置
- **脚本工具**：自动化脚本 + 项目管理工具

**模块化组织原则**：
- **职责分离**：每个目录和文件有明确的职责
- **统一导出**：通过index.ts文件提供清晰的模块接口
- **路径别名**：使用@/前缀简化导入路径
- **类型安全**：完整的TypeScript类型定义

#### 🔧 代码质量体系建立

**ESLint配置核心**：
- **TypeScript规则**：类型检查、未使用变量检测
- **React规则**：Hook使用、组件最佳实践
- **导入规则**：导入顺序、路径组织
- **代码风格**：统一的编码标准

**Prettier格式化策略**：
- **代码格式统一**：缩进、引号、分号等格式标准
- **导入排序**：自动组织导入语句顺序
- **跨平台一致性**：确保不同系统下格式一致
- **团队协作友好**：减少格式相关的代码冲突

#### 📦 工具链集成优化

**VS Code工作区配置**：
- **编辑器设置**：格式化、自动修复、类型提示
- **插件推荐**：团队统一的插件配置
- **调试配置**：高效的开发和调试环境
- **快捷键优化**：提升开发效率的键盘快捷键

**自动化脚本系统**：
- **组件生成器**：快速创建标准化组件
- **项目检查器**：验证项目结构完整性
- **Git Hooks**：提交前的代码质量检查
- **构建脚本**：开发、构建、部署的自动化

### 重要工具和最佳实践

#### 目录组织最佳实践

**按功能分层**：
```
功能 → 目录映射：
前端UI → app/components/
API接口 → app/api/
AI逻辑 → src/agent/
数据处理 → src/database/
业务服务 → src/services/
```

**命名约定**：
- **目录名**：kebab-case（如：chat-components）
- **文件名**：PascalCase（组件）、camelCase（工具函数）
- **常量**：UPPER_SNAKE_CASE
- **接口**：PascalCase + Props/Config后缀

#### 代码质量保证策略

**多层质量检查**：
```
编写阶段 → VS Code实时提示
保存阶段 → 自动格式化
提交阶段 → Git Hooks检查
构建阶段 → 类型检查 + Lint检查
```

**团队协作规范**：
- **统一的代码风格**：通过Prettier自动化
- **严格的类型检查**：TypeScript strict模式
- **导入路径标准**：使用路径别名，按组织排序
- **文档注释规范**：JSDoc注释规范

### 技能要点和关键理解

#### 核心技能掌握检查

**项目组织能力**：
- [ ] 能够设计符合最佳实践的目录结构
- [ ] 理解分层架构在文件组织中的体现
- [ ] 掌握模块化导出和路径别名的使用
- [ ] 能够建立清晰的代码组织规范

**工具配置能力**：
- [ ] 能够配置ESLint实现代码质量检查
- [ ] 能够配置Prettier实现代码格式统一
- [ ] 能够配置VS Code提升开发效率
- [ ] 能够使用TypeScript进行类型安全开发

**自动化思维**：
- [ ] 能够编写脚本自动化重复任务
- [ ] 能够配置Git Hooks保证代码质量
- [ ] 能够建立标准化的开发工作流
- [ ] 能够为团队制定开发规范

#### 实际应用的关键点

**可维护性设计**：
1. **清晰的模块边界**：每个模块有明确的输入输出
2. **一致的命名规范**：团队成员都能理解的命名方式
3. **完善的类型定义**：为所有接口和数据结构定义类型
4. **文档化的配置**：所有配置都有清晰的说明

**扩展性考虑**：
1. **预留扩展空间**：目录结构支持新功能的添加
2. **插件化设计**：核心功能支持插件扩展
3. **配置化管理**：通过配置文件控制应用行为
4. **版本兼容性**：考虑未来升级的兼容性问题

### 学习检查清单

#### 基础掌握标准（必须达到）
- [ ] 完成标准的项目目录结构创建
- [ ] 配置好ESLint和Prettier工具
- [ ] 设置好TypeScript路径别名
- [ ] 创建基础的类型定义和工具函数

#### 进阶理解标准（建议达到）
- [ ] 理解分层架构在项目结构中的体现
- [ ] 能够自定义ESLint和Prettier规则
- [ ] 掌握VS Code工作区的高级配置
- [ ] 能够编写自动化脚本提升效率

#### 专业应用标准（优秀目标）
- [ ] 能够为团队设计标准化的项目模板
- [ ] 能够建立完整的代码质量保证体系
- [ ] 能够优化开发工具链的性能和效率
- [ ] 能够指导他人进行项目架构设计

---

## 🚀 课程总结与展望

### 学习成果的肯定

🎉 **恭喜你完成了项目结构搭建的学习！**

这一小节看似在"整理文件夹"，但实际上你完成了软件架构师的重要工作。你现在拥有的不仅仅是一个整洁的项目结构，而是一个专业、可扩展、易维护的AI应用开发架构！

#### 🌟 你获得的核心能力

1. **架构设计能力**：
   - 将抽象的分层架构转化为具体的目录结构
   - 建立了清晰的模块边界和依赖关系
   - 具备了大型项目的组织和管理能力

2. **代码质量管理能力**：
   - 通过工具链保证代码质量和一致性
   - 建立了自动化的代码检查和格式化流程
   - 具备了团队协作的标准化能力

3. **开发效率优化能力**：
   - 配置了高效的开发环境和工作流
   - 建立了自动化脚本减少重复工作
   - 具备了持续改进开发流程的意识

#### 🎊 实际的价值体现

**立即可见的价值**：
- ✅ 拥有了专业级的项目架构
- ✅ 建立了自动化的代码质量保证
- ✅ 提升了开发效率和代码一致性

**长期受益的投资**：
- 🚀 为大型项目的发展奠定了基础
- 🤝 为团队协作建立了标准和规范
- 📈 为代码质量和可维护性提供了保障
- 🎯 为成为架构师级别的开发者迈出了重要一步

### 与下节课的衔接

#### 🔗 从架构基础到环境配置

你现在已经建立了完整的项目架构，下节课（2.4 环境变量配置）我们将配置AI服务所需的环境变量，让这个架构真正"活"起来！

**今天的架构基础**将在下节课发挥作用：
- **清晰的配置文件组织**：为环境变量提供合适的位置
- **类型安全的配置**：为API密钥等配置提供类型检查
- **模块化的服务层**：为AI服务配置提供清晰的接口

**下节课的精彩内容**：
- 配置OpenAI API密钥和相关环境变量
- 建立安全的敏感信息管理机制
- 验证完整的AI应用运行环境
- 测试从前端到AI服务的完整链路

#### 📚 第二章的完整收官

```
2.1节：工具安装 → 基础设施
2.2节：项目初始化 → 项目骨架  
2.3节：结构搭建 → 架构完善（今天）
2.4节：环境配置 → 系统就绪（下节）
```

下节课完成后，你将拥有一个完全可以运行AI功能的项目环境！

### 课后思考建议

#### 🤔 架构理解题

**设计思维题**：
1. 为什么我们要将AI相关代码放在`src/agent/`而不是`app/ai/`？
2. 如果项目需要支持多种AI模型，你会如何调整目录结构？
3. 当项目规模扩大到100+组件时，如何保持目录结构的清晰性？

**最佳实践题**：
1. 如何在代码质量和开发效率之间找到平衡？
2. 什么情况下应该创建新的模块目录？
3. 如何为团队制定适合的代码规范？

**扩展思考题**：
1. 除了我们配置的工具，还有哪些工具可以进一步提升代码质量？
2. 如何设计目录结构以支持微前端架构？
3. 在大型团队中，如何保证架构标准的执行？

#### 📖 实践巩固建议

**架构优化练习**：
1. **自定义组件生成器**：扩展生成脚本，支持更多组件类型
2. **代码质量仪表板**：创建脚本监控代码质量指标
3. **项目模板化**：将当前架构封装为可复用的项目模板

**团队协作准备**：
1. **文档编写**：为项目架构编写详细的说明文档
2. **标准制定**：基于当前架构制定团队开发标准
3. **培训材料**：准备新成员入门的培训资料

### 激励继续学习的话语

#### 🎊 为你的架构师思维点赞

完成这一节的学习，证明你已经具备了：
- **系统性思维**：能够从整体角度设计和组织复杂系统
- **标准化意识**：理解规范和标准在软件开发中的重要性
- **工程化思维**：通过工具和流程保证项目质量
- **团队协作能力**：建立了支持团队协作的基础设施

这些能力将是你在软件开发职业生涯中的宝贵财富！

#### 🚀 即将完成环境准备的里程碑

下节课完成后，第二章的学习就将圆满结束，你将拥有：
- 🛠️ **完整的开发工具链**
- 📦 **标准化的项目架构**
- 🔧 **自动化的质量保证**
- ⚙️ **可运行的AI环境**

这意味着你将完全准备好开始真正的AI应用开发！

#### 💪 持续学习的动力

**想象一下即将到来的精彩**：
- 🎨 在第3章中创建美观的聊天界面
- 🤖 在第5章中让AI真正开始对话
- 🚀 在最后几章中完成一个完整的AI应用

**记住你现在的成就**：
- ✅ 你已经掌握了专业级的项目架构设计
- ✅ 你已经建立了高效的开发工作流
- ✅ 你已经具备了团队协作的技术基础
- ✅ 你已经为AI应用开发做好了充分准备

---

## 🎯 结语

今天我们一起完成了项目结构的搭建工作！从分层架构的目录设计到代码质量的工具配置，从模块化的组织方式到自动化的开发流程，你已经建立了一个专业而强大的AI应用开发架构。

**记住今天最重要的三个成就**：
1. 🏗️ **建立了清晰的分层架构**：app/ + src/ 的科学组织
2. 🔧 **配置了完整的工具链**：ESLint + Prettier + TypeScript + Git Hooks
3. 📦 **创建了模块化的代码组织**：统一导出 + 路径别名 + 类型安全

**为下节课的环境配置做好准备**：
- 期待看到项目真正运行起来的激动时刻
- 准备好配置AI服务和测试完整功能
- 相信自己已经具备了处理复杂配置的能力

架构的搭建让你具备了专业开发者的代码组织能力，环境的配置将让你的项目真正具备AI功能！

**让我们带着完善的架构基础，开始下节课的环境配置之旅！** 🚀

---

> **学习提示**：建议花一些时间熟悉刚才创建的目录结构和配置文件，理解每个部分的作用。这将帮助你在后续的开发中更加得心应手。记住，好的架构是成功项目的基础！
