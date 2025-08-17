/**
 * 3.2 Next.js项目应用 - 类型定义文件
 * 
 * 这个文件集中定义了应用中使用的所有TypeScript类型和接口。
 * 
 * 🎯 学习要点：
 * 1. TypeScript类型系统的组织和管理
 * 2. 接口设计的最佳实践
 * 3. 类型复用和扩展技巧
 * 4. API响应的类型安全设计
 * 5. 前后端类型一致性保障
 */

// ================================
// 基础数据类型定义
// ================================

/**
 * 消息角色枚举
 * 
 * 💡 设计说明：
 * - 使用字符串字面量类型而不是enum
 * - 便于JSON序列化和网络传输
 * - 更好的TypeScript推断支持
 */
export type MessageRole = 'user' | 'assistant' | 'system'

/**
 * 消息状态枚举
 * 
 * 💡 状态说明：
 * - pending: 等待发送
 * - sending: 正在发送
 * - streaming: 正在接收流式响应
 * - completed: 消息完成
 * - failed: 发送失败
 */
export type MessageStatus = 'pending' | 'sending' | 'streaming' | 'completed' | 'failed'

/**
 * API响应状态枚举
 */
export type APIStatus = 'success' | 'error' | 'loading'

// ================================
// 核心业务类型定义
// ================================

/**
 * 消息接口定义
 * 
 * 🎯 设计原则：
 * 1. 完整性：包含消息的所有必要信息
 * 2. 扩展性：支持未来功能扩展
 * 3. 类型安全：严格的类型约束
 * 4. 序列化友好：便于JSON转换
 */
export interface Message {
    /** 消息唯一标识符 */
    id: string

    /** 消息内容 */
    content: string

    /** 消息发送者角色 */
    role: MessageRole

    /** 消息创建时间戳 */
    timestamp: Date

    /** 会话ID，用于关联消息到特定对话 */
    sessionId?: string

    /** 消息状态 */
    status?: MessageStatus

    /** 是否正在流式接收（仅用于AI消息） */
    isStreaming?: boolean

    /** 消息元数据 */
    metadata?: MessageMetadata

    /** 错误信息（当status为failed时） */
    error?: string
}

/**
 * 消息元数据接口
 * 
 * 💡 用途：存储消息的额外信息
 * - 性能指标：响应时间、token数量等
 * - 技术信息：使用的模型、API版本等
 * - 业务信息：用户反馈、质量评分等
 */
export interface MessageMetadata {
    /** 使用的AI模型名称 */
    model?: string

    /** 消息token数量 */
    tokenCount?: number

    /** API响应时间（毫秒） */
    responseTime?: number

    /** API版本 */
    apiVersion?: string

    /** 用户评分（1-5星） */
    userRating?: number

    /** 用户反馈 */
    userFeedback?: string

    /** 内容类型标记 */
    contentType?: 'text' | 'markdown' | 'code' | 'json'

    /** 内容语言 */
    language?: string

    /** 是否为敏感内容 */
    isSensitive?: boolean
}

/**
 * 会话接口定义
 * 
 * 🎯 设计目标：
 * - 管理对话的完整生命周期
 * - 支持会话元数据和配置
 * - 便于会话列表展示和管理
 */
export interface Session {
    /** 会话唯一标识符 */
    id: string

    /** 会话标题/名称 */
    title: string

    /** 会话创建时间 */
    createdAt: Date

    /** 会话最后更新时间 */
    updatedAt: Date

    /** 消息数量 */
    messageCount?: number

    /** 最后一条消息的预览 */
    lastMessagePreview?: string

    /** 会话配置 */
    config?: SessionConfig

    /** 会话标签 */
    tags?: string[]

    /** 是否已归档 */
    isArchived?: boolean

    /** 是否固定在顶部 */
    isPinned?: boolean
}

/**
 * 会话配置接口
 * 
 * 💡 用途：自定义会话行为和AI参数
 */
export interface SessionConfig {
    /** AI模型名称 */
    model?: string

    /** 温度参数（创造性控制） */
    temperature?: number

    /** 最大token数 */
    maxTokens?: number

    /** 系统提示词 */
    systemPrompt?: string

    /** 是否启用流式响应 */
    enableStreaming?: boolean

    /** 历史消息保留数量 */
    maxHistoryMessages?: number
}

// ================================
// API相关类型定义
// ================================

/**
 * 标准API响应格式
 * 
 * 🎯 设计目标：
 * - 统一的响应格式
 * - 完整的错误信息
 * - 类型安全的数据传输
 */
export interface APIResponse<T = any> {
    /** 操作是否成功 */
    success: boolean

    /** 响应数据 */
    data?: T

    /** 错误信息 */
    error?: string

    /** 错误代码 */
    errorCode?: string

    /** 响应时间戳 */
    timestamp: string

    /** 请求ID（用于追踪） */
    requestId?: string

    /** 分页信息（用于列表接口） */
    pagination?: PaginationInfo
}

/**
 * 分页信息接口
 */
export interface PaginationInfo {
    /** 当前页码 */
    page: number

    /** 每页数量 */
    limit: number

    /** 总数量 */
    total: number

    /** 总页数 */
    totalPages: number

    /** 是否有下一页 */
    hasNext: boolean

    /** 是否有上一页 */
    hasPrevious: boolean
}

/**
 * 聊天API请求接口
 */
export interface ChatRequest {
    /** 用户消息内容 */
    message: string

    /** 会话ID */
    threadId: string

    /** 是否启用流式响应 */
    stream?: boolean

    /** 自定义配置 */
    config?: Partial<SessionConfig>
}

/**
 * 聊天API响应接口（非流式）
 */
export interface ChatResponse {
    /** AI回复内容 */
    response: string

    /** 消息ID */
    messageId: string

    /** 使用的模型 */
    model: string

    /** 响应元数据 */
    metadata: MessageMetadata
}

/**
 * 流式响应数据块接口
 */
export interface StreamChunk {
    /** 数据块类型 */
    type: 'chunk' | 'end' | 'error' | 'metadata'

    /** 文本内容（type为chunk时） */
    content?: string

    /** 错误信息（type为error时） */
    error?: string

    /** 元数据（type为metadata时） */
    metadata?: MessageMetadata

    /** 时间戳 */
    timestamp: number

    /** 位置信息（用于处理乱序） */
    position?: number
}

/**
 * 会话管理API请求接口
 */
export interface SessionRequest {
    /** 会话标题 */
    title?: string

    /** 会话配置 */
    config?: SessionConfig

    /** 会话标签 */
    tags?: string[]
}

// ================================
// UI组件相关类型
// ================================

/**
 * 聊天消息组件Props类型
 */
export interface ChatMessageProps {
    /** 消息数据 */
    message: Message

    /** 是否显示头像 */
    showAvatar?: boolean

    /** 是否显示时间戳 */
    showTimestamp?: boolean

    /** 自定义CSS类名 */
    className?: string

    /** 消息点击回调 */
    onMessageClick?: (message: Message) => void

    /** 动画延迟（秒） */
    animationDelay?: number
}

/**
 * 消息输入组件Props类型
 */
export interface MessageInputProps {
    /** 输入值 */
    value: string

    /** 值变化回调 */
    onChange: (value: string) => void

    /** 发送消息回调 */
    onSend: (message: string) => void

    /** 是否禁用 */
    disabled?: boolean

    /** 占位符文本 */
    placeholder?: string

    /** 最大字符数 */
    maxLength?: number

    /** 是否显示字符计数 */
    showCharCount?: boolean

    /** 自定义CSS类名 */
    className?: string
}

/**
 * 会话侧边栏组件Props类型
 */
export interface SessionSidebarProps {
    /** 当前会话ID */
    currentSessionId: string

    /** 会话选择回调 */
    onSessionSelect: (sessionId: string) => void

    /** 新建会话回调 */
    onNewSession: () => void

    /** 删除会话回调 */
    onDeleteSession?: (sessionId: string) => void

    /** 重命名会话回调 */
    onRenameSession?: (sessionId: string, newTitle: string) => void

    /** 是否显示侧边栏 */
    isVisible?: boolean

    /** 自定义CSS类名 */
    className?: string
}

// ================================
// 应用状态相关类型
// ================================

/**
 * 应用全局状态接口
 */
export interface AppState {
    /** 当前会话 */
    currentSession: Session | null

    /** 消息列表 */
    messages: Message[]

    /** 会话列表 */
    sessions: Session[]

    /** 应用加载状态 */
    isLoading: boolean

    /** 错误信息 */
    error: string | null

    /** 用户配置 */
    userConfig: UserConfig
}

/**
 * 用户配置接口
 */
export interface UserConfig {
    /** 主题设置 */
    theme: 'light' | 'dark' | 'auto'

    /** 语言设置 */
    language: string

    /** 默认AI模型 */
    defaultModel: string

    /** 是否启用音效 */
    enableSound: boolean

    /** 是否显示时间戳 */
    showTimestamps: boolean

    /** 是否启用键盘快捷键 */
    enableKeyboardShortcuts: boolean

    /** 字体大小 */
    fontSize: 'small' | 'medium' | 'large'

    /** 消息动画 */
    enableAnimations: boolean
}

// ================================
// 错误处理相关类型
// ================================

/**
 * 应用错误类型枚举
 */
export type ErrorType =
    | 'NETWORK_ERROR'        // 网络错误
    | 'API_ERROR'            // API错误  
    | 'VALIDATION_ERROR'     // 数据验证错误
    | 'AUTH_ERROR'           // 认证错误
    | 'PERMISSION_ERROR'     // 权限错误
    | 'RATE_LIMIT_ERROR'     // 请求限制错误
    | 'UNKNOWN_ERROR'        // 未知错误

/**
 * 错误信息接口
 */
export interface AppError {
    /** 错误类型 */
    type: ErrorType

    /** 错误消息 */
    message: string

    /** 错误代码 */
    code?: string

    /** 错误详情 */
    details?: any

    /** 发生时间 */
    timestamp: Date

    /** 错误堆栈（开发环境） */
    stack?: string
}

// ================================
// 工具类型定义
// ================================

/**
 * 深度部分类型
 * 
 * 💡 用途：将接口的所有属性（包括嵌套）设为可选
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 选择性必需类型
 * 
 * 💡 用途：将接口的部分属性设为必需
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * 不包含某些字段的类型
 * 
 * 💡 用途：从接口中排除特定字段
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

/**
 * 只包含某些字段的类型
 * 
 * 💡 用途：从接口中只选择特定字段
 */
export type Pick<T, K extends keyof T> = {
    [P in K]: T[P]
}

// ================================
// 类型守卫函数
// ================================

/**
 * 检查是否为有效的消息对象
 */
export function isMessage(obj: any): obj is Message {
    return (
        obj &&
        typeof obj.id === 'string' &&
        typeof obj.content === 'string' &&
        ['user', 'assistant', 'system'].includes(obj.role) &&
        obj.timestamp instanceof Date
    )
}

/**
 * 检查是否为有效的会话对象
 */
export function isSession(obj: any): obj is Session {
    return (
        obj &&
        typeof obj.id === 'string' &&
        typeof obj.title === 'string' &&
        obj.createdAt instanceof Date &&
        obj.updatedAt instanceof Date
    )
}

/**
 * 检查是否为API响应格式
 */
export function isAPIResponse<T>(obj: any): obj is APIResponse<T> {
    return (
        obj &&
        typeof obj.success === 'boolean' &&
        typeof obj.timestamp === 'string'
    )
}

/**
 * 🎓 学习总结
 * 
 * 通过这个类型定义文件，你学到了：
 * 
 * 1. TypeScript类型系统的组织和管理策略
 * 2. 接口设计的最佳实践和扩展技巧
 * 3. 类型安全的API设计方法
 * 4. 前后端类型一致性的保障机制
 * 5. 工具类型的定义和使用技巧
 * 6. 类型守卫函数的实现方法
 * 7. 错误处理的类型化设计
 * 
 * 🎯 类型设计原则：
 * - 完整性：类型定义要覆盖所有使用场景
 * - 一致性：命名和结构要保持统一风格
 * - 扩展性：设计要便于未来功能扩展
 * - 安全性：严格的类型约束防止错误
 * - 可读性：清晰的注释和文档
 * 
 * 🚀 进一步优化方向：
 * - 添加更多的工具类型和泛型
 * - 实现更复杂的类型约束和验证
 * - 集成运行时类型检查库
 * - 建立类型测试和验证机制
 * - 生成API文档和类型文档
 */


