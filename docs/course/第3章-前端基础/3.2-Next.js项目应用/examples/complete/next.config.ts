/**
 * 3.2 Next.js项目应用 - Next.js配置文件
 * 
 * 这是Next.js项目的配置文件，定义了框架的各种行为和优化设置。
 * 
 * 🎯 学习要点：
 * 1. Next.js配置的基础结构和语法
 * 2. 性能优化的配置选项
 * 3. 开发和生产环境的差异化配置
 * 4. 安全性和兼容性设置
 * 5. 自定义构建和部署配置
 */

import type { NextConfig } from 'next'

/**
 * Next.js配置对象
 * 
 * 🔧 配置说明：
 * 这个配置文件控制Next.js的各种行为，包括：
 * - 编译和构建设置
 * - 性能优化选项
 * - 开发体验改进
 * - 部署相关配置
 * - 安全和兼容性设置
 */
const nextConfig: NextConfig = {

    // 🚀 基础配置

    /**
     * TypeScript配置
     * 
     * 🎯 作用：
     * - ignoreBuildErrors: 是否在构建时忽略TypeScript错误
     * - 建议：开发时设为false，确保类型安全
     */
    typescript: {
        ignoreBuildErrors: false, // 严格的类型检查
    },

    /**
     * ESLint配置
     * 
     * 🎯 作用：
     * - ignoreDuringBuilds: 是否在构建时忽略ESLint错误
     * - 建议：保持false，确保代码质量
     */
    eslint: {
        ignoreDuringBuilds: false, // 严格的代码质量检查
    },

    // ⚡ 性能优化配置

    /**
     * 实验性功能配置
     * 
     * 🔬 说明：
     * Next.js的实验性功能，可以提前体验新特性
     * 注意：实验性功能可能在未来版本中发生变化
     */
    experimental: {
        /**
         * 优化包导入
         * 
         * 💡 作用：
         * - 自动优化第三方包的导入
         * - 减少bundle大小
         * - 提升构建速度
         */
        optimizePackageImports: [
            'lucide-react',    // 图标库优化
            'date-fns',        // 日期库优化（如果使用）
            'lodash',          // 工具库优化（如果使用）
        ],

        /**
         * 服务端组件外部包配置
         * 
         * 💡 作用：
         * - 指定哪些包应该在服务端运行
         * - 优化服务端渲染性能
         */
        serverExternalPackages: [
            // 在这里添加需要在服务端运行的包
        ],

        /**
         * 严格的Next.js检查
         * 
         * 🛡️ 作用：
         * - 启用更严格的Next.js规则检查
         * - 帮助发现潜在问题
         */
        strictNextHead: true,
    },

    // 🖼️ 图片优化配置

    /**
     * 图片优化设置
     * 
     * 📸 说明：
     * Next.js内置的图片优化功能配置
     */
    images: {
        /**
         * 图片格式配置
         * 
         * 💡 说明：
         * - 支持现代图片格式
         * - 自动选择最优格式
         */
        formats: ['image/webp', 'image/avif'],

        /**
         * 允许的图片域名
         * 
         * 🔒 安全考虑：
         * - 限制图片来源，防止恶意图片
         * - 根据实际需求添加域名
         */
        domains: [
            // 在这里添加允许的图片域名
            // 'example.com',
        ],

        /**
         * 图片尺寸配置
         * 
         * 📐 说明：
         * - 预定义的响应式图片尺寸
         * - 优化不同设备的显示效果
         */
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },

    // 🌐 国际化配置（可选）

    /**
     * 国际化设置
     * 
     * 🌍 说明：
     * 如果需要多语言支持，可以启用此配置
     */
    // i18n: {
    //   locales: ['zh-CN', 'en-US'],
    //   defaultLocale: 'zh-CN',
    //   localeDetection: true,
    // },

    // 🔧 构建优化配置

    /**
     * 输出配置
     * 
     * 📦 说明：
     * - 控制构建输出的格式和行为
     * - 适用于不同的部署环境
     */
    output: 'standalone', // 独立输出，便于Docker部署

    /**
     * 压缩配置
     * 
     * 🗜️ 说明：
     * - 生产环境自动压缩资源
     * - 减少传输大小
     */
    compress: true,

    /**
     * 生成ETags
     * 
     * 🏷️ 说明：
     * - 启用HTTP ETag支持
     * - 优化缓存策略
     */
    generateEtags: true,

    // 🔒 安全配置

    /**
     * 安全头部配置
     * 
     * 🛡️ 说明：
     * 配置HTTP安全头部，提升应用安全性
     */
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY', // 防止iframe嵌入
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff', // 防止MIME类型嗅探
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin', // 引用策略
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()', // 权限策略
                    },
                ],
            },
        ]
    },

    // 📝 重定向配置

    /**
     * URL重定向规则
     * 
     * 🔄 说明：
     * 定义URL重定向规则，用于：
     * - 旧URL兼容
     * - SEO优化
     * - 用户体验改进
     */
    async redirects() {
        return [
            // 示例：将旧路径重定向到新路径
            // {
            //   source: '/old-chat',
            //   destination: '/',
            //   permanent: true,
            // },
        ]
    },

    // 🔗 重写配置

    /**
     * URL重写规则
     * 
     * 🔄 说明：
     * URL重写不会改变浏览器地址栏，用于：
     * - API代理
     * - 路径简化
     * - 内部路由处理
     */
    async rewrites() {
        return [
            // 示例：API代理配置
            // {
            //   source: '/api/external/:path*',
            //   destination: 'https://external-api.com/:path*',
            // },
        ]
    },

    // 🚫 忽略配置

    /**
     * 构建时忽略的文件
     * 
     * 📁 说明：
     * 指定在构建过程中应该忽略的文件和目录
     */
    pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mdx', 'md'],

    // 🔧 Webpack配置扩展

    /**
     * 自定义Webpack配置
     * 
     * ⚙️ 说明：
     * 可以扩展Next.js的默认Webpack配置
     * 注意：谨慎修改，可能影响构建稳定性
     */
    webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {

        // 📊 开发环境的额外配置
        if (dev) {
            // 开发环境特定的配置
            config.devtool = 'eval-cheap-module-source-map'
        }

        // 🔧 自定义模块解析
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,      // 浏览器环境不支持fs模块
            net: false,     // 浏览器环境不支持net模块
            dns: false,     // 浏览器环境不支持dns模块
        }

        // 📦 优化配置
        if (!isServer) {
            config.optimization.splitChunks = {
                ...config.optimization.splitChunks,
                cacheGroups: {
                    ...config.optimization.splitChunks.cacheGroups,
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                    },
                },
            }
        }

        return config
    },

    // 📱 PWA配置（可选）

    /**
     * 渐进式Web应用配置
     * 
     * 📱 说明：
     * 如果需要PWA功能，可以添加相关配置
     */
    // pwa: {
    //   dest: 'public',
    //   register: true,
    //   skipWaiting: true,
    // },

    // 🔍 分析配置

    /**
     * Bundle分析配置
     * 
     * 📊 说明：
     * 用于分析打包结果，优化bundle大小
     */
    env: {
        ANALYZE: process.env.ANALYZE,
    },
}

// 📊 Bundle分析器集成（可选）
if (process.env.ANALYZE === 'true') {
    const withBundleAnalyzer = require('@next/bundle-analyzer')({
        enabled: true,
    })
    module.exports = withBundleAnalyzer(nextConfig)
} else {
    module.exports = nextConfig
}

export default nextConfig

/**
 * 🎓 学习总结
 * 
 * 通过这个Next.js配置文件，你学到了：
 * 
 * 1. Next.js配置的完整结构和选项
 * 2. 性能优化的配置策略和最佳实践
 * 3. 安全性配置和HTTP头部设置
 * 4. 开发和生产环境的差异化配置
 * 5. Webpack自定义配置的方法和注意事项
 * 6. 图片优化和资源管理配置
 * 7. URL处理和路由配置技巧
 * 
 * 🔧 配置的重要性：
 * - 合适的配置可以显著提升应用性能
 * - 安全配置是生产环境的必要保障
 * - 开发体验的优化提升工作效率
 * - 构建优化减少部署时间和资源消耗
 * 
 * 🚀 进一步优化方向：
 * - 根据具体需求调整配置参数
 * - 集成更多第三方优化工具
 * - 实现环境特定的配置管理
 * - 监控和分析应用性能指标
 * - 持续优化构建和部署流程
 */


