/**
 * 3.2 Next.js项目应用 - 根布局组件
 * 
 * 这是Next.js应用的根布局文件，定义了整个应用的HTML结构和全局配置。
 * 
 * 🎯 学习要点：
 * 1. 根布局的作用和重要性
 * 2. Metadata配置 - SEO和页面信息设置
 * 3. 字体优化 - Next.js内置的字体优化
 * 4. 全局样式的引入和管理
 * 5. HTML文档结构的设计
 * 6. 语言和可访问性设置
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/**
 * 字体配置 - Next.js的字体优化特性
 * 
 * 💡 Next.js字体优化的优势：
 * - 自动字体子集化：只加载使用的字符
 * - 字体预加载：提升首屏渲染性能
 * - 自动字体显示优化：减少布局偏移
 * - CSS变量支持：便于在CSS中使用
 * 
 * 🎨 字体选择说明：
 * - Geist Sans：现代无衬线字体，适合界面文本
 * - Geist Mono：等宽字体，适合代码显示
 */
const geistSans = Geist({
  variable: "--font-geist-sans",  // CSS变量名
  subsets: ["latin"],             // 字符子集
  display: "swap",                // 字体显示策略
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * 元数据配置 - SEO和页面信息
 * 
 * 🔍 SEO优化要点：
 * 1. 标题和描述要准确描述应用功能
 * 2. 关键词要与目标用户搜索习惯匹配
 * 3. 作者信息增加权威性
 * 4. 视口配置确保移动端体验
 * 5. 图标和主题色彩配置
 * 
 * 📱 移动端优化：
 * - viewport配置：确保响应式设计正常工作
 * - 主题色彩：与应用设计风格一致
 * - 图标配置：支持添加到主屏幕
 */
export const metadata: Metadata = {
  // 📄 基础页面信息
  title: "LangGraph AI 聊天应用 | 智能对话助手",
  description: "基于 LangGraphJS 和 Next.js 构建的智能聊天应用，支持实时对话、流式响应和多轮交互",
  
  // 🔍 SEO关键词
  keywords: [
    "AI聊天", 
    "LangGraph", 
    "Next.js", 
    "人工智能", 
    "智能助手", 
    "实时对话",
    "流式响应",
    "React"
  ],
  
  // 👥 作者信息
  authors: [
    { name: "LangGraph Team", url: "https://github.com/langchain-ai/langgraphjs" }
  ],
  
  // 🌐 语言和地区
  generator: "Next.js",
  applicationName: "LangGraph AI Chat",
  referrer: "origin-when-cross-origin",
  
  // 📱 移动端配置
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  
  // 🎨 主题和外观
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f23" },
  ],
  
  // 🔗 Open Graph社交媒体配置
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://your-domain.com",
    title: "LangGraph AI 聊天应用",
    description: "智能对话助手，支持实时交互和流式响应",
    siteName: "LangGraph AI Chat",
  },
  
  // 🐦 Twitter卡片配置
  twitter: {
    card: "summary_large_image",
    title: "LangGraph AI 聊天应用",
    description: "基于LangGraphJS构建的智能聊天应用",
  },
  
  // 🤖 机器人和爬虫配置
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

/**
 * 根布局组件
 * 
 * 🏗️ 布局设计原则：
 * 1. 最小化HTML结构：只包含必要元素
 * 2. 语义化标签：使用正确的HTML语义
 * 3. 无障碍支持：确保可访问性
 * 4. 性能优化：避免不必要的嵌套
 * 5. 全局样式：统一的字体和样式变量
 * 
 * 📝 类型说明：
 * - children: React.ReactNode - 页面内容将渲染在这里
 * - Readonly<>: TypeScript只读类型，确保Props不被修改
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      {/* 🎨 全局样式配置 */}
      <head>
        {/* 预连接到外部资源，提升性能 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* 应用图标配置 */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* 应用清单文件 */}
        <link rel="manifest" href="/manifest.json" />
      </head>
      
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 🎨 全局CSS样式定义 */}
        <style jsx global>{`
          /**
           * 自定义CSS变量
           * 使用CSS变量便于主题切换和样式统一
           */
          :root {
            --font-geist-sans: ${geistSans.style.fontFamily};
            --font-geist-mono: ${geistMono.style.fontFamily};
            
            /* 应用主题色彩 */
            --color-primary: #8b5cf6;
            --color-secondary: #06b6d4;
            --color-accent: #ec4899;
            
            /* 渐变色定义 */
            --gradient-primary: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
            --gradient-secondary: linear-gradient(135deg, #ec4899 0%, #f97316 100%);
            
            /* 阴影样式 */
            --shadow-soft: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            --shadow-medium: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            --shadow-strong: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          
          /**
           * 全局基础样式重置
           * 确保跨浏览器的一致性
           */
          * {
            box-sizing: border-box;
            padding: 0;
            margin: 0;
          }
          
          html,
          body {
            max-width: 100vw;
            overflow-x: hidden;
            scroll-behavior: smooth;
          }
          
          body {
            font-family: var(--font-geist-sans), system-ui, sans-serif;
            line-height: 1.6;
            color: rgb(var(--foreground-rgb));
            background: rgb(var(--background-rgb));
          }
          
          /**
           * 自定义滚动条样式
           * 提升视觉体验和品牌一致性
           */
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 3px;
            transition: background 0.3s ease;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
          }
          
          /* Firefox滚动条样式 */
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
          }
          
          /**
           * 输入框滚动条样式
           * 专门为输入组件设计的滚动条
           */
          .input-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          
          .input-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          
          .input-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
          }
          
          /**
           * 打字机光标动画
           * 流式响应时的视觉效果
           */
          .typing-cursor {
            animation: blink 1s infinite;
          }
          
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
          
          /**
           * 淡入动画
           * 消息出现时的动画效果
           */
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          /**
           * 输入框焦点效果
           * 增强用户交互体验
           */
          .input-focus-effect {
            position: relative;
          }
          
          .input-focus-effect::before {
            content: '';
            position: absolute;
            inset: -2px;
            padding: 2px;
            background: var(--gradient-primary);
            border-radius: 12px;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: -1;
          }
          
          .input-focus-effect:focus-within::before {
            opacity: 1;
          }
          
          /**
           * 响应式设计辅助类
           * 移动端优化样式
           */
          @media (max-width: 768px) {
            body {
              font-size: 14px;
            }
            
            .custom-scrollbar::-webkit-scrollbar {
              width: 4px;
            }
          }
          
          /**
           * 高对比度模式支持
           * 无障碍访问优化
           */
          @media (prefers-contrast: high) {
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.8);
            }
          }
          
          /**
           * 减少动画偏好支持
           * 尊重用户的动画偏好设置
           */
          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
            
            .typing-cursor {
              animation: none;
              opacity: 1;
            }
          }
          
          /**
           * 打印样式优化
           * 确保打印时的良好表现
           */
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            
            .typing-cursor {
              display: none;
            }
            
            * {
              box-shadow: none !important;
              text-shadow: none !important;
            }
          }
        `}</style>
        
        {/* 🚀 应用主内容 */}
        {children}
        
        {/* 🔧 开发环境工具 */}
        {process.env.NODE_ENV === 'development' && (
          <div id="__next_error__" />
        )}
      </body>
    </html>
  );
}

/**
 * 🎓 学习总结
 * 
 * 通过这个根布局组件，你学到了：
 * 
 * 1. Next.js根布局的设计模式和最佳实践
 * 2. Metadata配置和SEO优化技巧
 * 3. 字体优化和性能提升方法
 * 4. 全局样式管理和CSS变量使用
 * 5. 响应式设计和可访问性支持
 * 6. 浏览器兼容性和用户偏好适配
 * 7. 开发和生产环境的差异处理
 * 
 * 🔄 与页面组件的关系：
 * - 根布局提供全局结构和样式基础
 * - 页面组件专注于具体功能实现
 * - 两者配合构成完整的应用体验
 * 
 * 🚀 进一步优化方向：
 * - 添加主题切换功能（明暗模式）
 * - 集成国际化支持（i18n）
 * - 优化字体加载策略
 * - 添加服务工作者（Service Worker）
 * - 实现渐进式Web应用（PWA）功能
 */


