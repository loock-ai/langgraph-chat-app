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
  async generateFinalReport(
    title: string,
    content: string,
    metadata: any = {}
  ): Promise<string> {
    const htmlContent = this.generateHtmlTemplate(title, content, metadata);

    const htmlFile: GeneratedFile = {
      id: `${this.sessionId}-final-report`,
      sessionId: this.sessionId,
      name: 'index.html',
      type: 'html',
      content: htmlContent,
      path: 'index.html',
      size: Buffer.byteLength(htmlContent, 'utf-8'),
      createdAt: new Date(),
    };

    await this.saveFile(htmlFile);

    // 生成CSS和JS文件
    await this.generateAssets();

    return 'index.html';
  }

  // 生成HTML模板
  private generateHtmlTemplate(
    title: string,
    content: string,
    metadata: any
  ): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - 深度研究报告</title>
    <link rel="stylesheet" href="./assets/styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <meta name="description" content="由 DeepResearch AI 助手生成的研究报告">
    <meta name="generator" content="DeepResearch AI">
    <meta name="theme-color" content="#3B82F6">
</head>
<body>
    <!-- 顶部固定导航栏 -->
    <header class="top-navbar" id="topNavbar">
        <div class="navbar-content">
            <div class="navbar-left">
                <button class="sidebar-toggle" id="sidebarToggle" aria-label="切换侧边栏">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <h1 class="navbar-title">${title}</h1>
            </div>
            <div class="navbar-right">
                <div class="navbar-meta">
                    <span class="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        ${new Date().toLocaleString('zh-CN')}
                    </span>
                    <span class="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 19c-5 0-8-3-8-8s3-8 8-8 8 3 8 8-3 8-8 8z"/>
                            <path d="M15 11h4a2 2 0 0 1 2 2v3.5a2 2 0 0 1-2 2H9"/>
                        </svg>
                        AI 研究报告
                    </span>
                </div>
                <button class="theme-toggle" id="themeToggle" aria-label="切换主题">
                    <svg class="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="5"/>
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                    </svg>
                    <svg class="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                </button>
            </div>
        </div>
    </header>

    <!-- 主要布局容器 -->
    <div class="main-layout">
        <!-- 左侧导航栏 -->
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-content">
                <div class="sidebar-header">
                    <h2>目录导航</h2>
                    <div class="progress-indicator">
                        <div class="progress-bar" id="readingProgress"></div>
                    </div>
                </div>
                <nav class="toc" id="toc">
                    <div id="toc-content">
                        <!-- 自动生成的目录 -->
                    </div>
                </nav>
                <div class="sidebar-footer">
                    <div class="report-info">
                        <p class="info-label">会话ID</p>
                        <p class="info-value">${this.sessionId}</p>
                    </div>
                    <div class="ai-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                            <path d="M2 17l10 5 10-5"/>
                            <path d="M2 12l10 5 10-5"/>
                        </svg>
                        DeepResearch AI
                    </div>
                </div>
            </div>
        </aside>

        <!-- 右侧内容区域 -->
        <main class="content-area">
            <div class="content-container">
                <article class="report-content" id="reportContent">
                    ${content}
                </article>
                
                <!-- 底部信息 -->
                <footer class="content-footer">
                    <div class="footer-content">
                        <div class="footer-left">
                            <p>本报告由 <strong>DeepResearch AI 助手</strong> 自动生成</p>
                            <p class="footer-meta">生成时间: ${new Date().toLocaleString(
                              'zh-CN'
                            )}</p>
                        </div>
                        <div class="footer-right">
                            <button class="export-btn" id="exportBtn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="7,10 12,15 17,10"/>
                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                                导出报告
                            </button>
                        </div>
                    </div>
                </footer>
            </div>
        </main>
    </div>

    <!-- 回到顶部按钮 -->
    <button class="back-to-top" id="backToTop" aria-label="回到顶部">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 15l-6-6-6 6"/>
        </svg>
    </button>

    <!-- 侧边栏遮罩层 -->
    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <script src="./assets/script.js"></script>
</body>
</html>`;
  }

  // 生成样式文件
  private async generateAssets(): Promise<void> {
    const cssContent = `
/* 现代化研究报告样式 */
:root {
    --primary-color: #3B82F6;
    --primary-dark: #2563EB;
    --secondary-color: #6366F1;
    --accent-color: #10B981;
    --text-primary: #1F2937;
    --text-secondary: #6B7280;
    --text-muted: #9CA3AF;
    --bg-primary: #FFFFFF;
    --bg-secondary: #F9FAFB;
    --bg-tertiary: #F3F4F6;
    --border-color: #E5E7EB;
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    --navbar-height: 64px;
    --sidebar-width: 320px;
    --border-radius: 12px;
    --transition: all 0.3s ease;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    scroll-behavior: smooth;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.6;
    color: var(--text-primary);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

/* 顶部导航栏 */
.top-navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: var(--navbar-height);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border-color);
    z-index: 1000;
}

.navbar-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 24px;
}

.navbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.navbar-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
}

.navbar-right {
    display: flex;
    align-items: center;
    gap: 16px;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.875rem;
    color: var(--text-secondary);
}

/* 主布局 */
.main-layout {
    display: flex;
    margin-top: var(--navbar-height);
    min-height: calc(100vh - var(--navbar-height));
}

/* 侧边栏 */
.sidebar {
    width: var(--sidebar-width);
    background: var(--bg-primary);
    border-right: 1px solid var(--border-color);
    position: fixed;
    left: 0;
    top: var(--navbar-height);
    height: calc(100vh - var(--navbar-height));
    overflow-y: auto;
    z-index: 100;
}

.sidebar-content {
    padding: 24px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.sidebar-header h2 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 16px;
}

.progress-indicator {
    width: 100%;
    height: 4px;
    background: var(--bg-tertiary);
    border-radius: 2px;
    margin-bottom: 24px;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    width: 0%;
    transition: width 0.3s ease;
}

/* 目录导航 */
.toc ul {
    list-style: none;
}

.toc a {
    display: block;
    padding: 8px 12px;
    color: var(--text-secondary);
    text-decoration: none;
    border-radius: 8px;
    transition: var(--transition);
    font-size: 0.875rem;
}

.toc a:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
}

.toc a.active {
    background: var(--primary-color);
    color: white;
}

.toc .toc-h2 {
    margin-left: 12px;
}

.toc .toc-h3 {
    margin-left: 24px;
    font-size: 0.8125rem;
}

.sidebar-footer {
    margin-top: auto;
    padding-top: 24px;
    border-top: 1px solid var(--border-color);
}

.ai-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    border-radius: 8px;
    font-size: 0.875rem;
}

/* 内容区域 */
.content-area {
    flex: 1;
    margin-left: var(--sidebar-width);
    background: var(--bg-primary);
}

.content-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 40px;
}

.report-content {
    background: white;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
}

/* 内容样式 */
.report-content h1,
.report-content h2,
.report-content h3 {
    background: white;
    padding: 24px 32px;
    margin: 0;
    border-bottom: 1px solid var(--border-color);
}

.report-content h1 {
    font-size: 2rem;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
}

.report-content h2 {
    font-size: 1.5rem;
    background: var(--bg-secondary);
    color: var(--text-primary);
}

.report-content h3 {
    font-size: 1.25rem;
    background: var(--bg-tertiary);
}

.report-content p,
.report-content ul,
.report-content ol,
.report-content blockquote,
.report-content table {
    padding: 0 32px;
    margin: 16px 0;
}

.report-content blockquote {
    border-left: 4px solid var(--primary-color);
    background: var(--bg-secondary);
    padding: 16px 32px;
    margin: 24px 0;
    font-style: italic;
}

.report-content table {
    width: calc(100% - 64px);
    margin: 24px 32px;
    border-collapse: collapse;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: var(--shadow-sm);
}

.report-content th,
.report-content td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
}

.report-content th {
    background: var(--bg-secondary);
    font-weight: 600;
}

.report-content code {
    background: var(--bg-tertiary);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', monospace;
    font-size: 0.875rem;
}

.report-content pre {
    background: #1F2937;
    color: #F9FAFB;
    padding: 24px 32px;
    margin: 24px 0;
    overflow-x: auto;
    position: relative;
}

.report-content pre code {
    background: none;
    padding: 0;
    color: inherit;
}

/* 底部 */
.content-footer {
    margin-top: 40px;
    padding: 24px 32px;
    background: var(--bg-secondary);
    border-radius: var(--border-radius);
}

.footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.export-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: var(--transition);
}

.export-btn:hover {
    background: var(--primary-dark);
}

/* 回到顶部按钮 */
.back-to-top {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 48px;
    height: 48px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: var(--shadow-lg);
    opacity: 0;
    transform: translateY(20px);
    transition: var(--transition);
}

.back-to-top.visible {
    opacity: 1;
    transform: translateY(0);
}

/* 侧边栏切换按钮 */
.sidebar-toggle {
    display: none;
    flex-direction: column;
    gap: 4px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: var(--transition);
}

.sidebar-toggle span {
    width: 20px;
    height: 2px;
    background: var(--text-primary);
    transition: var(--transition);
}

.sidebar-toggle:hover {
    background: var(--bg-tertiary);
}

/* 侧边栏遮罩层 */
.sidebar-overlay {
    position: fixed;
    top: var(--navbar-height);
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99;
    opacity: 0;
    visibility: hidden;
    transition: var(--transition);
}

.sidebar-overlay.active {
    opacity: 1;
    visibility: visible;
}

/* 主题切换按钮 */
.theme-toggle {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: var(--transition);
    color: var(--text-secondary);
}

.theme-toggle:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
}

.moon-icon {
    display: none;
}

[data-theme="dark"] .sun-icon {
    display: none;
}

[data-theme="dark"] .moon-icon {
    display: block;
}

/* 信息标签样式 */
.info-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
}

.info-value {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-family: 'Monaco', 'Menlo', monospace;
    word-break: break-all;
}

.footer-meta {
    font-size: 0.875rem;
    color: var(--text-muted);
    margin-top: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .sidebar {
        transform: translateX(-100%);
    }
    
    .sidebar.open {
        transform: translateX(0);
    }
    
    .content-area {
        margin-left: 0;
    }
    
    .sidebar-toggle {
        display: flex;
    }
    
    .content-container {
        padding: 20px;
    }
    
    .navbar-meta {
        display: none;
    }
    
    .navbar-title {
        font-size: 1.125rem;
        max-width: 200px;
    }
    
    .report-content h1,
    .report-content h2,
    .report-content h3 {
        padding: 16px 20px;
    }
    
    .report-content p,
    .report-content ul,
    .report-content ol,
    .report-content blockquote,
    .report-content table {
        padding: 0 20px;
    }
    
    .report-content blockquote {
        padding: 12px 20px;
    }
    
    .report-content table {
        width: calc(100% - 40px);
        margin: 16px 20px;
    }
    
    .report-content pre {
        padding: 16px 20px;
    }
    
    .footer-content {
        flex-direction: column;
        gap: 16px;
        text-align: center;
    }
}

@media (max-width: 480px) {
    .content-container {
        padding: 16px;
    }
    
    .navbar-content {
        padding: 0 16px;
    }
    
    .back-to-top {
        bottom: 16px;
        right: 16px;
        width: 44px;
        height: 44px;
    }
}
`;

    const jsContent = `
// 自动生成目录
function generateTOC() {
    const content = document.querySelector('.report-content');
    const tocContent = document.getElementById('toc-content');
    
    if (!content || !tocContent) return;
    
    const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    if (headings.length === 0) {
        document.querySelector('.toc').style.display = 'none';
        return;
    }
    
    const tocList = document.createElement('ul');
    
    headings.forEach((heading, index) => {
        if (!heading.id) {
            heading.id = 'heading-' + index;
        }
        
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + heading.id;
        a.textContent = heading.textContent;
        a.className = 'toc-' + heading.tagName.toLowerCase();
        
        li.appendChild(a);
        tocList.appendChild(li);
    });
    
    tocContent.appendChild(tocList);
}

// 平滑滚动
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 滚动进度
function updateReadingProgress() {
    const content = document.querySelector('.report-content');
    const progressBar = document.getElementById('readingProgress');
    
    if (!content || !progressBar) return;
    
    const scrollTop = window.pageYOffset;
    const docHeight = content.offsetHeight;
    const winHeight = window.innerHeight;
    const scrollPercent = scrollTop / (docHeight - winHeight);
    const scrollPercentRounded = Math.round(scrollPercent * 100);
    
    progressBar.style.width = Math.min(scrollPercentRounded, 100) + '%';
}

// 回到顶部按钮
function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 代码复制功能
function setupCodeCopy() {
    document.querySelectorAll('pre code').forEach(block => {
        const button = document.createElement('button');
        button.textContent = '复制';
        button.style.cssText = \`
            position: absolute;
            top: 8px;
            right: 8px;
            background: #374151;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            opacity: 0.8;
            transition: opacity 0.2s;
        \`;
        
        const pre = block.parentElement;
        if (pre) {
            pre.style.position = 'relative';
            pre.appendChild(button);
            
            button.addEventListener('click', () => {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(block.textContent || '').then(() => {
                        button.textContent = '已复制';
                        setTimeout(() => {
                            button.textContent = '复制';
                        }, 2000);
                    });
                }
            });
            
            button.addEventListener('mouseenter', () => {
                button.style.opacity = '1';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.opacity = '0.8';
            });
        }
    });
}

// 高亮当前章节
function highlightCurrentSection() {
    const headings = document.querySelectorAll('.report-content h1, .report-content h2, .report-content h3');
    const tocLinks = document.querySelectorAll('.toc a');
    
    let current = '';
    
    headings.forEach(heading => {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
            current = heading.id;
        }
    });
    
    tocLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

// 侧边栏切换
function setupSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebarToggle && sidebar && overlay) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });
        
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    generateTOC();
    setupSmoothScroll();
    setupBackToTop();
    setupCodeCopy();
    setupSidebarToggle();
    
    // 滚动事件监听
    window.addEventListener('scroll', () => {
        updateReadingProgress();
        highlightCurrentSection();
    });
    
    // 初始化进度和高亮
    updateReadingProgress();
    highlightCurrentSection();
});
`;

    // 保存CSS文件
    const cssFile: GeneratedFile = {
      id: `${this.sessionId}-styles`,
      sessionId: this.sessionId,
      name: 'styles.css',
      type: 'html',
      content: cssContent,
      path: 'assets/styles.css',
      size: Buffer.byteLength(cssContent, 'utf-8'),
      createdAt: new Date(),
    };

    // 保存JS文件
    const jsFile: GeneratedFile = {
      id: `${this.sessionId}-script`,
      sessionId: this.sessionId,
      name: 'script.js',
      type: 'html',
      content: jsContent,
      path: 'assets/script.js',
      size: Buffer.byteLength(jsContent, 'utf-8'),
      createdAt: new Date(),
    };

    await this.saveFile(cssFile);
    await this.saveFile(jsFile);
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
