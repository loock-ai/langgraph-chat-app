# 4.2 数据库实际应用

## 🎯 学习目标

- 掌握SQLite数据库基础操作
- 学会设计简单的数据模型
- 实现基本的CRUD功能
- 理解数据库连接管理

## 📚 核心内容

### SQLite基础应用
- 轻量级数据库的优势
- better-sqlite3库的使用
- 数据库文件管理
- 基础SQL操作

### 数据模型设计
- 消息表（messages）设计
- 会话表（sessions）设计
- 表关系和外键约束
- 数据类型选择

### 数据库操作实践
- 数据库初始化
- 增删改查操作
- 事务处理基础
- 连接池管理

## 💻 代码实战

```typescript
// app/agent/db.ts - 数据库基础操作
import Database from 'better-sqlite3';

const db = new Database('chat.db');

// 初始化表结构
export function initDatabase() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      content TEXT,
      role TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      session_id TEXT
    )
  `).run();
}

// 保存消息
export function saveMessage(message: Message) {
  const stmt = db.prepare(`
    INSERT INTO messages (id, content, role, session_id) 
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(message.id, message.content, message.role, message.sessionId);
}
```

## 📋 知识点总结

- SQLite是轻量级但功能强大的数据库
- 合理的数据模型设计是数据存储的基础
- better-sqlite3提供了简洁的Node.js数据库接口
- 基础CRUD操作满足大部分应用需求

## 🚀 下一步

有了数据存储能力，接下来我们学习如何实现流式响应，为实时聊天做准备。
