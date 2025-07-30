import fs from 'fs';
import path from 'path';
import { GeneratedFile } from '../../agent/deepresearch/types';
import { fileDb } from './db';

// 文件管理器
export class FileManager {
  private sessionId: string;
  private outputDir: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.outputDir = path.join(process.cwd(), 'public', sessionId);
    this.ensureDirectoryExists();
  }

  // 确保目录存在
  private ensureDirectoryExists() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // 创建子目录
    const subdirs = ['assets', 'data', 'sections'];
    subdirs.forEach((subdir) => {
      const dirPath = path.join(this.outputDir, subdir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  // 保存文件
  async saveFile(file: GeneratedFile): Promise<void> {
    const absolutePath = path.join(this.outputDir, file.path);
    const dir = path.dirname(absolutePath);

    // 确保目录存在
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 写入文件
    fs.writeFileSync(absolutePath, file.content, 'utf-8');

    // 保存到数据库
    fileDb.save({
      ...file,
      absolutePath,
      isPublic: true,
    });
  }

  // 读取文件
  async readFile(relativePath: string): Promise<string | null> {
    try {
      const absolutePath = path.join(this.outputDir, relativePath);
      if (!fs.existsSync(absolutePath)) {
        return null;
      }
      return fs.readFileSync(absolutePath, 'utf-8');
    } catch (error) {
      console.error('读取文件失败:', error);
      return null;
    }
  }

  // 获取文件列表
  getFileList(): any[] {
    return fileDb.getSessionFiles(this.sessionId);
  }

  // 生成文件树结构
  getFileTree(): any {
    const files = this.getFileList();
    const tree: any = {
      name: this.sessionId,
      type: 'directory',
      children: [],
    };

    files.forEach((file) => {
      const pathParts = file.relative_path.split('/');
      let current = tree;

      pathParts.forEach((part: string, index: number) => {
        if (index === pathParts.length - 1) {
          // 文件
          current.children.push({
            name: part,
            type: 'file',
            path: file.relative_path,
            size: file.size,
            fileType: file.type,
          });
        } else {
          // 目录
          let dir = current.children.find(
            (child: any) => child.name === part && child.type === 'directory'
          );
          if (!dir) {
            dir = {
              name: part,
              type: 'directory',
              children: [],
            };
            current.children.push(dir);
          }
          current = dir;
        }
      });
    });

    return tree;
  }

  // 生成最终的HTML报告
  async generateFinalReport(title: string, content: string): Promise<string> {
    const htmlFile: GeneratedFile = {
      id: `${this.sessionId}-final-report`,
      sessionId: this.sessionId,
      name: 'index.html',
      type: 'html',
      content: content,
      path: 'index.html',
      size: Buffer.byteLength(content, 'utf-8'),
      createdAt: new Date(),
    };

    await this.saveFile(htmlFile);

    return 'index.html';
  }

  // 清理会话文件
  async cleanup(): Promise<void> {
    try {
      if (fs.existsSync(this.outputDir)) {
        fs.rmSync(this.outputDir, { recursive: true, force: true });
      }
      fileDb.deleteSessionFiles(this.sessionId);
    } catch (error) {
      console.error('清理文件失败:', error);
    }
  }
}
