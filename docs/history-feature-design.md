# 聊天助手历史记录与切换功能设计文档

## 1. 需求描述

当前聊天助手仅支持单轮对话，用户无法查看或切换过往的聊天记录。为提升用户体验，需要增加：
- 聊天历史记录的保存与展示。
- 支持用户在不同历史会话间切换。
- 历史会话可点击进入，恢复对应对话内容。

## 2. 功能设计

### 2.1 界面设计
- 左侧新增"历史会话"侧边栏，展示所有历史会话列表（按时间倒序排列）。
- 每条历史会话显示：会话标题（可为首条消息摘要或自定义）、时间、可选删除按钮。
- 当前会话高亮显示。
- 点击历史会话，主聊天窗口切换到对应内容。
- 新建会话按钮，点击后清空主窗口，开始新对话。

### 2.2 交互流程
1. 用户每次发起新会话，自动生成新历史记录。
2. 用户在历史会话列表点击某条记录，主窗口切换到该会话。
3. 用户可删除某条历史会话，删除后不可恢复。
4. 支持会话重命名（可选）。

### 2.3 数据结构
- 会话（Session）对象：
  - id: string
  - title: string
  - createdAt: datetime
  - updatedAt: datetime
  - messages: Message[]
- Message 对象：
  - id: string
  - role: 'user' | 'assistant'
  - content: string
  - timestamp: datetime

- 所有会话以数组形式存储在本地数据库（如 SQLite/IndexedDB）或后端数据库。

## 3. 技术实现方案

### 3.1 前端
- 使用 React/Next.js 状态管理（如 useState/useContext/zustand）管理当前会话与历史会话列表。
- 历史会话侧边栏组件，支持增删查切换。
- 聊天窗口根据当前选中会话渲染消息。
- 新建会话、删除会话、切换会话等操作需同步更新本地和后端数据。

### 3.2 后端
- API 设计：
  - GET /api/sessions 获取所有历史会话
  - POST /api/sessions 新建会话
  - DELETE /api/sessions/:id 删除会话
  - PATCH /api/sessions/:id 重命名会话
  - GET /api/sessions/:id/messages 获取指定会话消息
  - POST /api/sessions/:id/messages 发送消息
- 数据库存储：chat_history.db 增加会话表与消息表，按会话 id 关联。

### 3.3 数据同步
- 前端操作后立即本地更新，异步同步到后端，保证流畅体验。
- 支持断网情况下本地缓存，恢复后自动同步。

## 4. 未来可扩展性建议
- 支持会话标签、搜索、归档等高级管理功能。
- 支持多端同步（如云端存储、账号体系）。
- 支持导出/导入历史会话。
- 支持会话内容分析、摘要、收藏等。

## 5. 技术文档：如何获取历史会话和指定会话的消息

### 5.1 获取历史会话列表
- **接口路径**：`GET /api/sessions`
- **请求方式**：GET
- **请求参数**：无
- **返回示例**：
```json
[
  {
    "id": "session_1",
    "title": "关于LangGraph的讨论",
    "createdAt": "2024-06-01T12:00:00Z",
    "updatedAt": "2024-06-01T12:30:00Z"
  },
  {
    "id": "session_2",
    "title": "代码调试记录",
    "createdAt": "2024-06-02T09:00:00Z",
    "updatedAt": "2024-06-02T09:15:00Z"
  }
]
```

### 5.2 获取指定会话的消息
- **接口路径**：`GET /api/sessions/{sessionId}/messages`
- **请求方式**：GET
- **请求参数**：
  - `sessionId`：会话ID（路径参数）
- **返回示例**：
```json
[
  {
    "id": "msg_1",
    "role": "user",
    "content": "你好，LangGraph 是什么？",
    "timestamp": "2024-06-01T12:01:00Z"
  },
  {
    "id": "msg_2",
    "role": "assistant",
    "content": "LangGraph 是一个对话流程编排框架……",
    "timestamp": "2024-06-01T12:01:05Z"
  }
]
```

---
如需更多接口细节或示例，请补充说明。 