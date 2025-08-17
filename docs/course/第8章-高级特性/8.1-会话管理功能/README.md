# 8.1 会话管理功能 💼

> 构建完整的多会话管理系统，实现会话的创建、切换、重命名和删除功能

---

## 🎯 学习目标

完成本节学习后，学员将能够：

- **设计高效的会话数据模型**：掌握会话表结构设计和数据库优化
- **实现完整的会话CRUD操作**：构建会话创建、读取、更新、删除的API接口
- **建立会话持久化机制**：确保会话数据的可靠存储和快速检索
- **掌握会话状态管理**：处理会话切换、数据同步和状态一致性
- **优化会话数据库性能**：通过索引和查询优化提升系统响应速度

---

## 📚 核心知识点

### 💾 会话数据模型设计

#### 数据库表结构

我们需要扩展现有的数据库设计，添加专门的会话管理表：

```sql
-- 会话表设计（SQLite版本）
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,                    -- 会话唯一标识符
  name TEXT NOT NULL,                     -- 会话显示名称
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 创建时间
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 最后更新时间
  message_count INTEGER DEFAULT 0,        -- 消息数量统计
  status TEXT DEFAULT 'active'            -- 会话状态：active/archived/deleted
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON sessions(updated_at DESC);
```

#### TypeScript接口定义

```typescript
// 会话数据接口
interface Session {
  id: string;              // 会话ID
  name: string;            // 会话名称
  createdAt: string;       // 创建时间（ISO字符串）
  updatedAt?: string;      // 更新时间（可选）
  messageCount?: number;   // 消息数量（可选）
  status?: 'active' | 'archived' | 'deleted';  // 会话状态
}

// API请求/响应接口
interface CreateSessionRequest {
  name?: string;           // 可选的会话名称
}

interface CreateSessionResponse {
  id: string;              // 新创建的会话ID
  name: string;            // 会话名称
}

interface UpdateSessionRequest {
  id: string;              // 要更新的会话ID
  name?: string;           // 新的会话名称
  status?: string;         // 新的会话状态
}

interface SessionListResponse {
  sessions: Session[];     // 会话列表
  total: number;           // 总数量（用于分页）
}
```

### 🔧 数据库操作实现

#### 数据库连接和初始化

首先，我们需要扩展现有的数据库操作文件：

```typescript
// app/agent/db.ts
import Database from 'better-sqlite3';
import path from 'path';
import { randomUUID } from 'crypto';

// 数据库连接
const dbPath = path.resolve(process.cwd(), 'chat_history.db');
export const db = new Database(dbPath);

// 数据库初始化 - 在应用启动时调用
export function initDatabase() {
  // 确保数据库目录存在
  const dbDir = path.dirname(dbPath);
  if (!require('fs').existsSync(dbDir)) {
    require('fs').mkdirSync(dbDir, { recursive: true });
  }

  // 创建会话表
  db.prepare(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      message_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active'
    )
  `).run();

  // 创建消息表（如果不存在）
  db.prepare(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      role TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      session_id TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
    )
  `).run();

  // 创建索引
  try {
    db.prepare('CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON sessions(updated_at DESC)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id)').run();
    db.prepare('CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)').run();
  } catch (error) {
    console.warn('索引创建警告:', error);
  }

  console.log('数据库初始化完成');
}

// 在模块加载时自动初始化
initDatabase();
```

#### 会话数据操作函数

```typescript
// 会话CRUD操作函数

/**
 * 创建新会话
 */
export function createSession(id: string, name: string): Session {
  try {
    const stmt = db.prepare(`
      INSERT INTO sessions (id, name, created_at, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(id, name);
    
    // 返回创建的会话信息
    const newSession = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as any;
    
    return {
      id: newSession.id,
      name: newSession.name,
      createdAt: newSession.created_at,
      updatedAt: newSession.updated_at,
      messageCount: 0,
      status: newSession.status
    };
  } catch (error) {
    console.error('创建会话失败:', error);
    throw new Error('会话创建失败');
  }
}

/**
 * 获取所有会话列表（按创建时间降序）
 */
export function getAllSessions(): Session[] {
  try {
    const stmt = db.prepare(`
      SELECT 
        s.*,
        COUNT(m.id) as message_count
      FROM sessions s
      LEFT JOIN messages m ON s.id = m.session_id
      WHERE s.status != 'deleted'
      GROUP BY s.id
      ORDER BY s.updated_at DESC, s.created_at DESC
    `);
    
    const sessions = stmt.all() as any[];
    
    // 转换数据格式，将数据库字段转换为驼峰式
    return sessions.map(session => ({
      id: session.id,
      name: session.name,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      messageCount: session.message_count || 0,
      status: session.status
    }));
  } catch (error) {
    console.error('获取会话列表失败:', error);
    return [];
  }
}

/**
 * 根据ID获取单个会话
 */
export function getSessionById(id: string): Session | null {
  try {
    const stmt = db.prepare(`
      SELECT 
        s.*,
        COUNT(m.id) as message_count
      FROM sessions s
      LEFT JOIN messages m ON s.id = m.session_id
      WHERE s.id = ? AND s.status != 'deleted'
      GROUP BY s.id
    `);
    
    const session = stmt.get(id) as any;
    
    if (!session) return null;
    
    return {
      id: session.id,
      name: session.name,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      messageCount: session.message_count || 0,
      status: session.status
    };
  } catch (error) {
    console.error('获取会话失败:', error);
    return null;
  }
}

/**
 * 更新会话名称
 */
export function updateSessionName(id: string, name: string): boolean {
  try {
    const stmt = db.prepare(`
      UPDATE sessions 
      SET name = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND status != 'deleted'
    `);
    
    const result = stmt.run(name.trim(), id);
    return result.changes > 0;
  } catch (error) {
    console.error('更新会话名称失败:', error);
    return false;
  }
}

/**
 * 更新会话的最后活动时间
 */
export function updateSessionActivity(id: string): boolean {
  try {
    const stmt = db.prepare(`
      UPDATE sessions 
      SET updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND status != 'deleted'
    `);
    
    const result = stmt.run(id);
    return result.changes > 0;
  } catch (error) {
    console.error('更新会话活动时间失败:', error);
    return false;
  }
}

/**
 * 删除会话（软删除）
 */
export function deleteSession(id: string): boolean {
  try {
    // 使用软删除，标记为deleted状态
    const stmt = db.prepare(`
      UPDATE sessions 
      SET status = 'deleted', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    
    const result = stmt.run(id);
    return result.changes > 0;
  } catch (error) {
    console.error('删除会话失败:', error);
    return false;
  }
}

/**
 * 物理删除会话和相关消息（谨慎使用）
 */
export function hardDeleteSession(id: string): boolean {
  try {
    // 开启事务确保数据一致性
    const deleteMessages = db.prepare('DELETE FROM messages WHERE session_id = ?');
    const deleteSession = db.prepare('DELETE FROM sessions WHERE id = ?');
    
    const transaction = db.transaction(() => {
      deleteMessages.run(id);
      deleteSession.run(id);
    });
    
    transaction();
    return true;
  } catch (error) {
    console.error('物理删除会话失败:', error);
    return false;
  }
}

/**
 * 获取会话统计信息
 */
export function getSessionStats() {
  try {
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_sessions,
        COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_sessions,
        SUM(
          (SELECT COUNT(*) FROM messages WHERE messages.session_id = sessions.id)
        ) as total_messages
      FROM sessions
      WHERE status != 'deleted'
    `);
    
    return stmt.get();
  } catch (error) {
    console.error('获取会话统计失败:', error);
    return null;
  }
}
```

### 🌐 API接口实现

创建会话管理的API路由：

```typescript
// app/api/chat/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { 
  getAllSessions, 
  createSession, 
  updateSessionName, 
  deleteSession,
  getSessionById,
  updateSessionActivity
} from '@/app/agent/db';

/**
 * GET /api/chat/sessions
 * 获取所有会话列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    // 如果指定了sessionId，返回单个会话信息
    if (sessionId) {
      const session = getSessionById(sessionId);
      if (!session) {
        return NextResponse.json(
          { error: '会话不存在' }, 
          { status: 404 }
        );
      }
      return NextResponse.json({ session });
    }
    
    // 返回所有会话列表
    const sessions = getAllSessions();
    
    return NextResponse.json({ 
      sessions,
      total: sessions.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('获取会话列表失败:', error);
    return NextResponse.json(
      { error: '获取会话列表失败' }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/sessions
 * 创建新会话
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;
    
    // 生成新的会话ID
    const sessionId = randomUUID();
    
    // 生成默认会话名称
    const sessionName = name?.trim() || `新会话-${sessionId.slice(0, 8)}`;
    
    // 创建会话
    const newSession = createSession(sessionId, sessionName);
    
    return NextResponse.json({
      id: newSession.id,
      name: newSession.name,
      createdAt: newSession.createdAt,
      message: '会话创建成功'
    }, { status: 201 });
    
  } catch (error) {
    console.error('创建会话失败:', error);
    return NextResponse.json(
      { error: '创建会话失败' }, 
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/chat/sessions
 * 更新会话信息（重命名等）
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, action } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: '会话ID不能为空' }, 
        { status: 400 }
      );
    }
    
    // 根据action执行不同操作
    if (action === 'rename' && name) {
      // 重命名会话
      const success = updateSessionName(id, name.trim());
      
      if (!success) {
        return NextResponse.json(
          { error: '会话重命名失败' }, 
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: '会话重命名成功'
      });
      
    } else if (action === 'touch') {
      // 更新会话活动时间
      const success = updateSessionActivity(id);
      
      if (!success) {
        return NextResponse.json(
          { error: '更新会话活动时间失败' }, 
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: '会话活动时间已更新'
      });
      
    } else {
      return NextResponse.json(
        { error: '无效的操作类型' }, 
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('更新会话失败:', error);
    return NextResponse.json(
      { error: '更新会话失败' }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chat/sessions
 * 删除会话
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, permanent = false } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: '会话ID不能为空' }, 
        { status: 400 }
      );
    }
    
    // 执行删除操作
    const success = deleteSession(id);
    
    if (!success) {
      return NextResponse.json(
        { error: '会话删除失败' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: permanent ? '会话已永久删除' : '会话已删除'
    });
    
  } catch (error) {
    console.error('删除会话失败:', error);
    return NextResponse.json(
      { error: '删除会话失败' }, 
      { status: 500 }
    );
  }
}
```

### 🔧 数据库优化策略

#### 索引优化

```sql
-- 创建复合索引优化常用查询
CREATE INDEX IF NOT EXISTS idx_sessions_status_updated ON sessions(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_session_timestamp ON messages(session_id, timestamp);

-- 为全文搜索创建索引（如果需要）
CREATE INDEX IF NOT EXISTS idx_sessions_name_search ON sessions(name COLLATE NOCASE);
```

#### 查询优化示例

```typescript
// 分页查询会话列表
export function getSessionsPaginated(page: number = 1, limit: number = 20) {
  try {
    const offset = (page - 1) * limit;
    
    const stmt = db.prepare(`
      SELECT 
        s.id, s.name, s.created_at, s.updated_at, s.status,
        COUNT(m.id) as message_count,
        MAX(m.timestamp) as last_message_time
      FROM sessions s
      LEFT JOIN messages m ON s.id = m.session_id
      WHERE s.status = 'active'
      GROUP BY s.id
      ORDER BY s.updated_at DESC
      LIMIT ? OFFSET ?
    `);
    
    const sessions = stmt.all(limit, offset);
    
    // 获取总数
    const countStmt = db.prepare(`
      SELECT COUNT(*) as total 
      FROM sessions 
      WHERE status = 'active'
    `);
    const { total } = countStmt.get() as any;
    
    return {
      sessions: sessions.map(formatSession),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('分页查询失败:', error);
    return { sessions: [], pagination: null };
  }
}

// 搜索会话
export function searchSessions(keyword: string, limit: number = 10) {
  try {
    const stmt = db.prepare(`
      SELECT 
        s.id, s.name, s.created_at, s.updated_at,
        COUNT(m.id) as message_count
      FROM sessions s
      LEFT JOIN messages m ON s.id = m.session_id
      WHERE s.status = 'active' 
        AND (s.name LIKE ? OR EXISTS (
          SELECT 1 FROM messages 
          WHERE session_id = s.id AND content LIKE ?
        ))
      GROUP BY s.id
      ORDER BY s.updated_at DESC
      LIMIT ?
    `);
    
    const searchTerm = `%${keyword}%`;
    return stmt.all(searchTerm, searchTerm, limit).map(formatSession);
  } catch (error) {
    console.error('搜索会话失败:', error);
    return [];
  }
}

// 格式化会话数据
function formatSession(session: any): Session {
  return {
    id: session.id,
    name: session.name,
    createdAt: session.created_at,
    updatedAt: session.updated_at,
    messageCount: session.message_count || 0,
    status: session.status
  };
}
```

---

## 🧪 测试和验证

### API测试示例

```typescript
// 测试会话管理API
async function testSessionAPI() {
  try {
    // 1. 创建新会话
    console.log('=== 测试创建会话 ===');
    const createResponse = await fetch('/api/chat/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '测试会话' })
    });
    const newSession = await createResponse.json();
    console.log('创建会话结果:', newSession);
    
    // 2. 获取会话列表
    console.log('=== 测试获取会话列表 ===');
    const listResponse = await fetch('/api/chat/sessions');
    const sessionList = await listResponse.json();
    console.log('会话列表:', sessionList);
    
    // 3. 重命名会话
    console.log('=== 测试重命名会话 ===');
    const renameResponse = await fetch('/api/chat/sessions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: newSession.id, 
        name: '重命名的会话',
        action: 'rename'
      })
    });
    const renameResult = await renameResponse.json();
    console.log('重命名结果:', renameResult);
    
    // 4. 删除会话
    console.log('=== 测试删除会话 ===');
    const deleteResponse = await fetch('/api/chat/sessions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: newSession.id })
    });
    const deleteResult = await deleteResponse.json();
    console.log('删除结果:', deleteResult);
    
  } catch (error) {
    console.error('API测试失败:', error);
  }
}
```

### 数据库测试

```typescript
// 测试数据库操作
function testDatabaseOperations() {
  console.log('=== 数据库操作测试 ===');
  
  try {
    // 测试创建会话
    const sessionId = randomUUID();
    const session = createSession(sessionId, '测试会话');
    console.log('创建会话:', session);
    
    // 测试获取会话列表
    const sessions = getAllSessions();
    console.log('会话列表:', sessions);
    
    // 测试更新会话名称
    const updateResult = updateSessionName(sessionId, '更新后的会话名称');
    console.log('更新结果:', updateResult);
    
    // 测试获取单个会话
    const singleSession = getSessionById(sessionId);
    console.log('单个会话:', singleSession);
    
    // 测试删除会话
    const deleteResult = deleteSession(sessionId);
    console.log('删除结果:', deleteResult);
    
  } catch (error) {
    console.error('数据库测试失败:', error);
  }
}
```

---

## 🚀 性能优化建议

### 数据库优化

1. **连接池管理**
```typescript
// 数据库连接池配置
const dbOptions = {
  timeout: 5000,
  verbose: process.env.NODE_ENV === 'development' ? console.log : null
};

export const db = new Database(dbPath, dbOptions);

// 设置WAL模式提升并发性能
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = 1000000');
db.pragma('temp_store = memory');
```

2. **查询优化技巧**
```typescript
// 预编译语句重用
const getSessionsStmt = db.prepare(`
  SELECT * FROM sessions 
  WHERE status = 'active' 
  ORDER BY updated_at DESC 
  LIMIT ?
`);

// 批量操作
const insertSessionsStmt = db.prepare(`
  INSERT INTO sessions (id, name) VALUES (?, ?)
`);

function createMultipleSessions(sessions: Array<{id: string, name: string}>) {
  const transaction = db.transaction(() => {
    for (const session of sessions) {
      insertSessionsStmt.run(session.id, session.name);
    }
  });
  
  return transaction();
}
```

### 内存优化

```typescript
// 实现LRU缓存减少数据库查询
class SessionCache {
  private cache = new Map<string, Session>();
  private maxSize = 100;
  
  get(id: string): Session | null {
    const session = this.cache.get(id);
    if (session) {
      // 移到末尾（最近使用）
      this.cache.delete(id);
      this.cache.set(id, session);
      return session;
    }
    return null;
  }
  
  set(id: string, session: Session): void {
    if (this.cache.size >= this.maxSize) {
      // 删除最老的项
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(id, session);
  }
  
  delete(id: string): void {
    this.cache.delete(id);
  }
  
  clear(): void {
    this.cache.clear();
  }
}

const sessionCache = new SessionCache();
```

---

## 💡 最佳实践总结

### 数据设计原则

1. **数据一致性**：使用事务确保相关操作的原子性
2. **软删除策略**：标记删除而非物理删除，便于数据恢复
3. **索引优化**：为常用查询字段创建合适的索引
4. **数据归档**：定期归档老旧数据，保持主表性能

### API设计原则

1. **RESTful设计**：遵循标准的HTTP方法语义
2. **错误处理**：提供清晰的错误信息和状态码
3. **数据验证**：在API层进行输入验证和清理
4. **版本管理**：为API接口提供版本控制

### 安全考虑

1. **输入验证**：防止SQL注入和XSS攻击
2. **权限控制**：确保用户只能操作自己的会话
3. **数据加密**：敏感数据加密存储
4. **审计日志**：记录重要操作的日志

---

## 🎯 实践任务

### 基础任务

1. **数据库设计**
   - [ ] 创建sessions表和相关索引
   - [ ] 实现数据库初始化函数
   - [ ] 测试基础的CRUD操作

2. **API开发**
   - [ ] 实现会话管理的REST API
   - [ ] 添加输入验证和错误处理
   - [ ] 编写API测试用例

3. **功能测试**
   - [ ] 测试会话创建和删除
   - [ ] 验证会话列表获取
   - [ ] 测试会话重命名功能

### 进阶任务

1. **性能优化**
   - [ ] 实现会话列表分页
   - [ ] 添加会话搜索功能
   - [ ] 优化数据库查询性能

2. **高级功能**
   - [ ] 实现会话导入导出
   - [ ] 添加会话标签功能
   - [ ] 实现会话统计分析

---

## 📚 相关资源

- [SQLite官方文档](https://www.sqlite.org/docs.html)
- [better-sqlite3使用指南](https://github.com/WiseLibs/better-sqlite3)
- [Next.js API Routes文档](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [TypeScript接口设计](https://www.typescriptlang.org/docs/handbook/interfaces.html)

---

下一节：[8.2 SessionSidebar组件实现](../8.2-SessionSidebar组件实现/README.md)
