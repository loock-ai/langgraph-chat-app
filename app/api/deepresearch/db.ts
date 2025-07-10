import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { ResearchState, GeneratedFile } from '../../agent/deepresearch/types';

// 数据库路径
const dbPath = path.join(process.cwd(), 'data', 'deepresearch.db');

// 确保数据目录存在
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 创建数据库连接
const db = new Database(dbPath);

// 初始化数据库表
export function initDatabase() {
  // 研究会话表
  db.exec(`
    CREATE TABLE IF NOT EXISTS research_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      question TEXT NOT NULL,
      status TEXT NOT NULL,
      progress INTEGER DEFAULT 0,
      state_data TEXT,
      output_path TEXT,
      final_html_file TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 生成文件表
  db.exec(`
    CREATE TABLE IF NOT EXISTS generated_files (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      relative_path TEXT NOT NULL,
      absolute_path TEXT NOT NULL,
      size INTEGER NOT NULL,
      is_public BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES research_sessions (id)
    )
  `);

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON research_sessions (user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_status ON research_sessions (status);
    CREATE INDEX IF NOT EXISTS idx_files_session_id ON generated_files (session_id);
  `);
}

// 会话数据库操作
export const sessionDb = {
  // 创建新会话
  create: (sessionId: string, userId: string, question: string) => {
    const stmt = db.prepare(`
      INSERT INTO research_sessions (id, user_id, question, status, output_path)
      VALUES (?, ?, ?, 'analyzing', ?)
    `);
    const outputPath = `public/${sessionId}`;
    return stmt.run(sessionId, userId, question, outputPath);
  },

  // 获取会话
  get: (sessionId: string) => {
    const stmt = db.prepare(`
      SELECT * FROM research_sessions WHERE id = ?
    `);
    return stmt.get(sessionId) as any;
  },

  // 更新会话状态
  updateStatus: (sessionId: string, status: string, progress: number = 0) => {
    const stmt = db.prepare(`
      UPDATE research_sessions 
      SET status = ?, progress = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(status, progress, sessionId);
  },

  // 更新会话状态数据
  updateState: (sessionId: string, state: ResearchState) => {
    const stmt = db.prepare(`
      UPDATE research_sessions 
      SET state_data = ?, status = ?, progress = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(
      JSON.stringify(state),
      state.status || 'analyzing',
      state.progress || 0,
      sessionId
    );
  },

  // 设置最终HTML文件
  setFinalHtml: (sessionId: string, htmlFile: string) => {
    const stmt = db.prepare(`
      UPDATE research_sessions 
      SET final_html_file = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(htmlFile, sessionId);
  },

  // 获取用户的所有会话
  getUserSessions: (userId: string) => {
    const stmt = db.prepare(`
      SELECT id, question, status, progress, created_at, updated_at
      FROM research_sessions 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `);
    return stmt.all(userId) as any[];
  },

  // 删除会话
  delete: (sessionId: string) => {
    const stmt = db.prepare(`DELETE FROM research_sessions WHERE id = ?`);
    return stmt.run(sessionId);
  },
};

// 文件数据库操作
export const fileDb = {
  // 保存文件
  save: (file: GeneratedFile & { absolutePath: string; isPublic: boolean }) => {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO generated_files 
      (id, session_id, name, type, content, relative_path, absolute_path, size, is_public, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    return stmt.run(
      file.id,
      file.sessionId,
      file.name,
      file.type,
      file.content,
      file.path,
      file.absolutePath,
      file.size,
      file.isPublic ? 1 : 0
    );
  },

  // 获取会话的所有文件
  getSessionFiles: (sessionId: string) => {
    const stmt = db.prepare(`
      SELECT * FROM generated_files WHERE session_id = ? ORDER BY created_at
    `);
    return stmt.all(sessionId) as any[];
  },

  // 获取特定文件
  getFile: (sessionId: string, relativePath: string) => {
    const stmt = db.prepare(`
      SELECT * FROM generated_files WHERE session_id = ? AND relative_path = ?
    `);
    return stmt.get(sessionId, relativePath) as any;
  },

  // 删除会话的所有文件
  deleteSessionFiles: (sessionId: string) => {
    const stmt = db.prepare(`DELETE FROM generated_files WHERE session_id = ?`);
    return stmt.run(sessionId);
  },
};

// 初始化数据库
initDatabase();

export default db;
