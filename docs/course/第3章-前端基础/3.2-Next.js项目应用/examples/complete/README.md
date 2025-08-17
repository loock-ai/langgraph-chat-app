# 3.2 Next.js项目应用 - 完整代码示例

> 本目录包含第3.2节课程的所有完整代码示例，可以直接复制使用

## 📁 文件结构

```
complete/
├── README.md                    # 本说明文件
├── app/
│   ├── page.tsx                # 主聊天页面（完整版）
│   ├── layout.tsx              # 根布局组件
│   ├── globals.css             # 全局样式
│   ├── components/             # 共享组件
│   │   ├── ChatMessage.tsx     # 消息组件
│   │   └── MessageInput.tsx    # 输入组件
│   ├── utils/                  # 工具函数
│   │   ├── api.ts              # API调用封装
│   │   └── types.ts            # 类型定义
│   └── api/
│       └── chat/
│           ├── route.ts        # 聊天API（流式响应）
│           └── sessions/
│               └── route.ts    # 会话管理API
├── package.json                # 依赖配置
└── next.config.ts              # Next.js配置
```

## 🚀 快速开始

### 1. 复制文件到你的项目

```bash
# 复制主要文件
cp -r examples/complete/app/* ./app/

# 或者手动复制每个文件的内容
```

### 2. 安装依赖

```bash
pnpm install lucide-react
```

### 3. 启动开发服务器

```bash
pnpm dev
```

## 📝 文件说明

每个文件都包含详细的中文注释，解释了：
- 代码的作用和原理
- Next.js特性的使用方法
- 最佳实践和注意事项
- 可能的扩展和优化方向

## 🔧 自定义和扩展

- 修改 `app/globals.css` 来调整全局样式
- 编辑 `app/components/` 中的组件来自定义界面
- 更新 `app/api/` 中的API来调整后端逻辑
- 参考 `app/utils/types.ts` 来了解数据结构

## 💡 学习建议

1. **逐个文件学习**：按照课程顺序逐个查看和理解每个文件
2. **动手修改**：尝试修改代码并观察效果
3. **对比差异**：将示例代码与你的代码进行对比
4. **扩展功能**：基于示例代码添加新功能

---

> 这些代码示例经过充分测试，可以直接在Next.js 15项目中使用。如果遇到问题，请检查依赖版本和文件路径。


