# 8.4 错误处理完善 🛡️

> 建立健壮的错误处理机制，实现用户友好的错误反馈和系统恢复能力

---

## 🎯 学习目标

完成本节学习后，学员将能够：

- **构建全面的错误处理体系**：覆盖前端、后端和AI集成的各种错误场景
- **实现用户友好的错误反馈**：提供清晰的错误信息和恢复建议
- **建立自动错误恢复机制**：实现重试逻辑、降级策略和容错处理
- **设计完善的错误监控系统**：记录、分析和预警各类错误
- **优化系统稳定性和可用性**：提升应用的健壮性和用户体验

---

## 📚 核心知识点

### 🚨 错误分类和处理策略

#### 错误类型分类

```typescript
// types/errors.ts
export enum ErrorType {
  // 网络错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  
  // API错误
  API_ERROR = 'API_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  
  // AI相关错误
  AI_MODEL_ERROR = 'AI_MODEL_ERROR',
  TOKEN_LIMIT_ERROR = 'TOKEN_LIMIT_ERROR',
  AI_TIMEOUT_ERROR = 'AI_TIMEOUT_ERROR',
  
  // 数据错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  DATA_CORRUPTION_ERROR = 'DATA_CORRUPTION_ERROR',
  
  // 系统错误
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  MEMORY_ERROR = 'MEMORY_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  
  // 用户错误
  USER_INPUT_ERROR = 'USER_INPUT_ERROR',
  SESSION_EXPIRED_ERROR = 'SESSION_EXPIRED_ERROR',
  
  // 未知错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export enum ErrorSeverity {
  LOW = 'low',           // 轻微错误，不影响主要功能
  MEDIUM = 'medium',     // 中等错误，影响部分功能
  HIGH = 'high',         // 严重错误，影响主要功能
  CRITICAL = 'critical'  // 致命错误，系统无法正常运行
}

// 应用错误基类
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly code: string;
  public readonly userMessage: string;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;
  public readonly retryable: boolean;

  constructor(
    type: ErrorType,
    message: string,
    userMessage: string,
    options: {
      severity?: ErrorSeverity;
      code?: string;
      context?: Record<string, any>;
      retryable?: boolean;
      cause?: Error;
    } = {}
  ) {
    super(message);
    
    this.name = 'AppError';
    this.type = type;
    this.severity = options.severity || ErrorSeverity.MEDIUM;
    this.code = options.code || type;
    this.userMessage = userMessage;
    this.context = options.context;
    this.timestamp = new Date();
    this.retryable = options.retryable ?? true;
    
    if (options.cause) {
      this.cause = options.cause;
    }
    
    // 保持堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

// 具体错误类型
export class NetworkError extends AppError {
  constructor(message: string, options?: { code?: string; context?: Record<string, any> }) {
    super(
      ErrorType.NETWORK_ERROR,
      message,
      '网络连接异常，请检查网络设置后重试',
      {
        severity: ErrorSeverity.HIGH,
        retryable: true,
        ...options
      }
    );
  }
}

export class AIModelError extends AppError {
  constructor(message: string, options?: { code?: string; context?: Record<string, any> }) {
    super(
      ErrorType.AI_MODEL_ERROR,
      message,
      'AI服务暂时不可用，请稍后重试',
      {
        severity: ErrorSeverity.HIGH,
        retryable: true,
        ...options
      }
    );
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(
      ErrorType.VALIDATION_ERROR,
      message,
      '输入信息有误，请检查后重新输入',
      {
        severity: ErrorSeverity.LOW,
        retryable: false,
        context: { field }
      }
    );
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, operation?: string) {
    super(
      ErrorType.DATABASE_ERROR,
      message,
      '数据处理异常，请稍后重试',
      {
        severity: ErrorSeverity.CRITICAL,
        retryable: true,
        context: { operation }
      }
    );
  }
}
```

#### 错误处理策略配置

```typescript
// utils/errorHandling.ts
interface ErrorHandlingConfig {
  retryAttempts: number;
  retryDelay: number;
  exponentialBackoff: boolean;
  enableFallback: boolean;
  enableLogging: boolean;
  enableUserNotification: boolean;
}

const DEFAULT_ERROR_CONFIG: Record<ErrorType, ErrorHandlingConfig> = {
  [ErrorType.NETWORK_ERROR]: {
    retryAttempts: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    enableFallback: true,
    enableLogging: true,
    enableUserNotification: true
  },
  [ErrorType.AI_MODEL_ERROR]: {
    retryAttempts: 2,
    retryDelay: 2000,
    exponentialBackoff: true,
    enableFallback: true,
    enableLogging: true,
    enableUserNotification: true
  },
  [ErrorType.VALIDATION_ERROR]: {
    retryAttempts: 0,
    retryDelay: 0,
    exponentialBackoff: false,
    enableFallback: false,
    enableLogging: false,
    enableUserNotification: true
  },
  [ErrorType.DATABASE_ERROR]: {
    retryAttempts: 3,
    retryDelay: 1500,
    exponentialBackoff: true,
    enableFallback: true,
    enableLogging: true,
    enableUserNotification: true
  },
  // ... 其他错误类型配置
};

export function getErrorConfig(errorType: ErrorType): ErrorHandlingConfig {
  return DEFAULT_ERROR_CONFIG[errorType] || DEFAULT_ERROR_CONFIG[ErrorType.UNKNOWN_ERROR];
}
```

### 🔄 重试机制实现

#### 智能重试Hook

```typescript
// hooks/useRetry.ts
import { useState, useCallback, useRef } from 'react';

interface RetryOptions {
  maxAttempts: number;
  delay: number;
  exponentialBackoff: boolean;
  shouldRetry?: (error: Error, attempt: number) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
  onGiveUp?: (error: Error, attempts: number) => void;
}

interface RetryState {
  isRetrying: boolean;
  attempts: number;
  lastError: Error | null;
}

export function useRetry<T extends (...args: any[]) => Promise<any>>(
  asyncFunction: T,
  options: RetryOptions
): [T, RetryState] {
  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attempts: 0,
    lastError: null
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  const wrappedFunction = useCallback(async (...args: Parameters<T>) => {
    const executeWithRetry = async (attempt: number): Promise<ReturnType<T>> => {
      try {
        setState(prev => ({ ...prev, attempts: attempt, isRetrying: attempt > 1 }));
        
        const result = await asyncFunction(...args);
        
        // 成功时重置状态
        setState({ isRetrying: false, attempts: 0, lastError: null });
        return result;
        
      } catch (error) {
        const err = error as Error;
        setState(prev => ({ ...prev, lastError: err }));

        // 检查是否应该重试
        const shouldRetry = options.shouldRetry ? 
          options.shouldRetry(err, attempt) : 
          attempt < options.maxAttempts;

        if (shouldRetry && attempt < options.maxAttempts) {
          // 触发重试回调
          options.onRetry?.(attempt, err);
          
          // 计算延迟时间
          const delay = options.exponentialBackoff 
            ? options.delay * Math.pow(2, attempt - 1)
            : options.delay;

          // 延迟后重试
          return new Promise((resolve, reject) => {
            timeoutRef.current = setTimeout(async () => {
              try {
                const result = await executeWithRetry(attempt + 1);
                resolve(result);
              } catch (retryError) {
                reject(retryError);
              }
            }, delay);
          });
        } else {
          // 放弃重试
          setState(prev => ({ ...prev, isRetrying: false }));
          options.onGiveUp?.(err, attempt);
          throw err;
        }
      }
    };

    return executeWithRetry(1);
  }, [asyncFunction, options]) as T;

  // 清理定时器
  useCallback(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [wrappedFunction, state];
}

// 网络请求重试示例
export function useApiWithRetry<T = any>(
  url: string,
  options?: RequestInit
) {
  const apiCall = useCallback(async (): Promise<T> => {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      // 根据状态码决定是否重试
      if (response.status >= 500 || response.status === 429) {
        throw new NetworkError(`API调用失败: ${response.status}`);
      } else if (response.status === 401) {
        throw new AppError(
          ErrorType.AUTHENTICATION_ERROR,
          'Authentication failed',
          '身份验证失败，请重新登录',
          { retryable: false }
        );
      } else {
        throw new AppError(
          ErrorType.API_ERROR,
          `API错误: ${response.status}`,
          '请求处理失败，请稍后重试'
        );
      }
    }
    
    return response.json();
  }, [url, options]);

  const [apiCallWithRetry, retryState] = useRetry(apiCall, {
    maxAttempts: 3,
    delay: 1000,
    exponentialBackoff: true,
    shouldRetry: (error, attempt) => {
      // 只重试网络错误和服务器错误
      if (error instanceof AppError) {
        return error.retryable && attempt < 3;
      }
      return attempt < 3;
    },
    onRetry: (attempt, error) => {
      console.log(`第${attempt}次重试 API 调用:`, error.message);
    }
  });

  return { apiCall: apiCallWithRetry, ...retryState };
}
```

#### 断路器模式

```typescript
// utils/circuitBreaker.ts
enum CircuitState {
  CLOSED = 'CLOSED',       // 正常状态
  OPEN = 'OPEN',           // 断路状态
  HALF_OPEN = 'HALF_OPEN'  // 半开状态
}

interface CircuitBreakerConfig {
  failureThreshold: number;    // 失败阈值
  recoveryTimeout: number;     // 恢复超时时间
  monitoringPeriod: number;    // 监控周期
  halfOpenMaxCalls: number;    // 半开状态最大调用次数
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private halfOpenCalls: number = 0;

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.config.recoveryTimeout) {
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenCalls = 0;
        console.log('🔧 断路器进入半开状态');
      } else {
        throw new AppError(
          ErrorType.SYSTEM_ERROR,
          'Circuit breaker is open',
          '服务暂时不可用，请稍后重试',
          { retryable: true }
        );
      }
    }

    if (this.state === CircuitState.HALF_OPEN && 
        this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
      throw new AppError(
        ErrorType.SYSTEM_ERROR,
        'Circuit breaker half-open limit exceeded',
        '服务正在恢复中，请稍后重试',
        { retryable: true }
      );
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.halfOpenMaxCalls) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
        console.log('✅ 断路器恢复正常状态');
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      console.log('❌ 断路器重新打开');
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      console.log('🔴 断路器打开，服务熔断');
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}

// AI服务断路器
export const aiServiceBreaker = new CircuitBreaker({
  failureThreshold: 5,
  recoveryTimeout: 30000, // 30秒
  monitoringPeriod: 60000, // 1分钟
  halfOpenMaxCalls: 3
});

// 使用断路器包装AI调用
export async function callAIWithCircuitBreaker<T>(
  operation: () => Promise<T>
): Promise<T> {
  return aiServiceBreaker.execute(operation);
}
```

### 🎯 用户友好的错误反馈

#### 错误通知系统

```typescript
// contexts/NotificationContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  persistent?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  showError: (error: AppError | Error) => string;
  showSuccess: (message: string, title?: string) => string;
  showWarning: (message: string, title?: string) => string;
  showInfo: (message: string, title?: string) => string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000
    };

    setNotifications(prev => [...prev, newNotification]);

    // 自动移除非持久化通知
    if (!notification.persistent && newNotification.duration! > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showError = useCallback((error: AppError | Error) => {
    if (error instanceof AppError) {
      return addNotification({
        type: NotificationType.ERROR,
        title: '操作失败',
        message: error.userMessage,
        actions: error.retryable ? [
          {
            label: '重试',
            action: () => {
              // 这里可以触发重试逻辑
              console.log('用户点击重试');
            },
            variant: 'primary'
          }
        ] : undefined,
        persistent: error.severity === ErrorSeverity.CRITICAL
      });
    } else {
      return addNotification({
        type: NotificationType.ERROR,
        title: '系统错误',
        message: '发生了未知错误，请联系技术支持',
        persistent: true
      });
    }
  }, [addNotification]);

  const showSuccess = useCallback((message: string, title: string = '操作成功') => {
    return addNotification({
      type: NotificationType.SUCCESS,
      title,
      message
    });
  }, [addNotification]);

  const showWarning = useCallback((message: string, title: string = '注意') => {
    return addNotification({
      type: NotificationType.WARNING,
      title,
      message
    });
  }, [addNotification]);

  const showInfo = useCallback((message: string, title: string = '提示') => {
    return addNotification({
      type: NotificationType.INFO,
      title,
      message
    });
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAllNotifications,
      showError,
      showSuccess,
      showWarning,
      showInfo
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// 通知容器组件
const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// 通知项组件
const NotificationItem: React.FC<{
  notification: Notification;
  onClose: () => void;
}> = ({ notification, onClose }) => {
  const getTypeStyles = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'bg-green-50 border-green-200 text-green-800';
      case NotificationType.ERROR:
        return 'bg-red-50 border-red-200 text-red-800';
      case NotificationType.WARNING:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case NotificationType.INFO:
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return (
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case NotificationType.ERROR:
        return (
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case NotificationType.WARNING:
        return (
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case NotificationType.INFO:
        return (
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 20 }}
      transition={{ duration: 0.3 }}
      className={`
        max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto 
        border ${getTypeStyles(notification.type)}
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIconForType(notification.type)}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium">
              {notification.title}
            </p>
            <p className="mt-1 text-sm opacity-90">
              {notification.message}
            </p>
            
            {/* 操作按钮 */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="mt-3 flex space-x-2">
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`
                      text-xs px-3 py-1 rounded-md font-medium transition-colors
                      ${action.variant === 'primary' 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }
                    `}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
```

#### 错误边界组件

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorType, AppError, ErrorSeverity } from '@/types/errors';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean; // 是否隔离错误影响范围
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // 创建结构化错误信息
    const structuredError = new AppError(
      ErrorType.SYSTEM_ERROR,
      `React Error Boundary: ${error.message}`,
      '应用出现异常，正在尝试恢复',
      {
        severity: ErrorSeverity.HIGH,
        code: 'REACT_ERROR_BOUNDARY',
        context: {
          componentStack: errorInfo.componentStack,
          errorBoundary: this.constructor.name,
          errorId: this.state.errorId
        }
      }
    );

    // 错误日志记录
    this.logError(structuredError, errorInfo);

    // 调用外部错误处理器
    this.props.onError?.(error, errorInfo);

    // 自动恢复尝试
    if (!this.props.isolate) {
      this.scheduleAutoRecovery();
    }
  }

  private logError(error: AppError, errorInfo: ErrorInfo) {
    console.group(`🚨 Error Boundary Caught Error [${error.errorId}]`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // 发送到错误监控服务
    if (typeof window !== 'undefined') {
      // 这里可以集成 Sentry、LogRocket 等错误监控服务
      this.sendErrorToMonitoring(error, errorInfo);
    }
  }

  private sendErrorToMonitoring(error: AppError, errorInfo: ErrorInfo) {
    // 示例：发送到监控服务
    const errorData = {
      errorId: error.errorId,
      message: error.message,
      type: error.type,
      severity: error.severity,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: error.timestamp,
      componentStack: errorInfo.componentStack,
      context: error.context
    };

    // 实际项目中可以替换为真实的监控服务API
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData)
    }).catch(err => {
      console.warn('Failed to send error to monitoring service:', err);
    });
  }

  private scheduleAutoRecovery() {
    // 10秒后自动尝试恢复
    this.retryTimeoutId = window.setTimeout(() => {
      console.log('🔄 尝试自动恢复应用...');
      this.handleRetry();
    }, 10000);
  }

  private handleRetry = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });

    console.log('✅ 应用已恢复');
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      // 使用自定义错误界面
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.handleRetry);
      }

      // 默认错误界面
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          isolate={this.props.isolate}
        />
      );
    }

    return this.props.children;
  }
}

// 默认错误回退界面
const DefaultErrorFallback: React.FC<{
  error: Error;
  errorInfo: ErrorInfo;
  onRetry: () => void;
  isolate?: boolean;
}> = ({ error, errorInfo, onRetry, isolate }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 text-red-500 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            应用出现异常
          </h2>
          
          <p className="text-gray-600 mb-8">
            {isolate ? '当前功能暂时不可用' : '应用遇到了意外错误，我们正在尝试恢复'}
          </p>

          <div className="space-y-4">
            <button
              onClick={onRetry}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              重新加载
            </button>

            <button
              onClick={() => window.location.reload()}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              刷新页面
            </button>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showDetails ? '隐藏' : '显示'}错误详情
            </button>
          </div>

          {showDetails && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
              <h3 className="text-sm font-medium text-gray-900 mb-2">错误详情：</h3>
              <div className="text-xs text-gray-600 space-y-2">
                <div>
                  <strong>错误消息：</strong>
                  <pre className="mt-1 whitespace-pre-wrap">{error.message}</pre>
                </div>
                <div>
                  <strong>错误位置：</strong>
                  <pre className="mt-1 whitespace-pre-wrap text-xs">{errorInfo.componentStack}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 高阶组件：为组件添加错误边界
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}
```

### 📊 错误监控和分析

#### 错误监控Hook

```typescript
// hooks/useErrorMonitoring.ts
import { useEffect, useCallback, useRef } from 'react';
import { AppError, ErrorType } from '@/types/errors';

interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<ErrorType, number>;
  recentErrors: AppError[];
  errorRate: number; // 错误率（每分钟）
}

interface ErrorMonitoringConfig {
  enableConsoleCapture: boolean;
  enableUnhandledRejectionCapture: boolean;
  enablePerformanceMonitoring: boolean;
  maxRecentErrors: number;
  reportingInterval: number; // 毫秒
}

export function useErrorMonitoring(config: ErrorMonitoringConfig) {
  const statsRef = useRef<ErrorStats>({
    totalErrors: 0,
    errorsByType: {} as Record<ErrorType, number>,
    recentErrors: [],
    errorRate: 0
  });

  const reportingIntervalRef = useRef<NodeJS.Timeout>();
  const errorTimestamps = useRef<number[]>([]);

  // 记录错误
  const recordError = useCallback((error: AppError) => {
    const stats = statsRef.current;
    const now = Date.now();

    // 更新统计信息
    stats.totalErrors++;
    stats.errorsByType[error.type] = (stats.errorsByType[error.type] || 0) + 1;
    
    // 添加到最近错误列表
    stats.recentErrors.unshift(error);
    if (stats.recentErrors.length > config.maxRecentErrors) {
      stats.recentErrors = stats.recentErrors.slice(0, config.maxRecentErrors);
    }

    // 记录时间戳用于计算错误率
    errorTimestamps.current.push(now);
    
    // 清理超过1分钟的时间戳
    const oneMinuteAgo = now - 60000;
    errorTimestamps.current = errorTimestamps.current.filter(t => t > oneMinuteAgo);
    
    // 计算错误率
    stats.errorRate = errorTimestamps.current.length;

    console.group(`📊 Error Monitoring - ${error.type}`);
    console.log('Error:', error);
    console.log('Stats:', stats);
    console.groupEnd();
  }, [config.maxRecentErrors]);

  // 发送监控报告
  const sendMonitoringReport = useCallback(() => {
    const stats = statsRef.current;
    
    if (stats.totalErrors > 0) {
      const report = {
        timestamp: new Date().toISOString(),
        ...stats,
        userAgent: navigator.userAgent,
        url: window.location.href,
        memoryUsage: (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit
        } : null
      };

      // 发送到监控服务
      fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      }).catch(err => {
        console.warn('Failed to send monitoring report:', err);
      });
    }
  }, []);

  // 设置定期报告
  useEffect(() => {
    if (config.reportingInterval > 0) {
      reportingIntervalRef.current = setInterval(sendMonitoringReport, config.reportingInterval);
      
      return () => {
        if (reportingIntervalRef.current) {
          clearInterval(reportingIntervalRef.current);
        }
      };
    }
  }, [config.reportingInterval, sendMonitoringReport]);

  // 捕获控制台错误
  useEffect(() => {
    if (!config.enableConsoleCapture) return;

    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      
      const error = new AppError(
        ErrorType.SYSTEM_ERROR,
        args.join(' '),
        '控制台错误',
        { context: { args, source: 'console' } }
      );
      
      recordError(error);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, [config.enableConsoleCapture, recordError]);

  // 捕获未处理的Promise拒绝
  useEffect(() => {
    if (!config.enableUnhandledRejectionCapture) return;

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = new AppError(
        ErrorType.SYSTEM_ERROR,
        `Unhandled Promise Rejection: ${event.reason}`,
        '系统异常',
        { 
          severity: ErrorSeverity.HIGH,
          context: { reason: event.reason, source: 'unhandledRejection' }
        }
      );
      
      recordError(error);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [config.enableUnhandledRejectionCapture, recordError]);

  // 性能监控
  useEffect(() => {
    if (!config.enablePerformanceMonitoring) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure' && entry.duration > 1000) {
          const error = new AppError(
            ErrorType.SYSTEM_ERROR,
            `Performance issue: ${entry.name} took ${entry.duration}ms`,
            '性能警告',
            { 
              severity: ErrorSeverity.LOW,
              context: { 
                performanceEntry: {
                  name: entry.name,
                  duration: entry.duration,
                  startTime: entry.startTime
                }
              }
            }
          );
          
          recordError(error);
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });
    
    return () => {
      observer.disconnect();
    };
  }, [config.enablePerformanceMonitoring, recordError]);

  return {
    recordError,
    getStats: () => statsRef.current,
    sendReport: sendMonitoringReport
  };
}

// 全局错误监控初始化
export function initializeGlobalErrorMonitoring() {
  const monitoring = useErrorMonitoring({
    enableConsoleCapture: true,
    enableUnhandledRejectionCapture: true,
    enablePerformanceMonitoring: true,
    maxRecentErrors: 50,
    reportingInterval: 300000 // 5分钟
  });

  // 将错误记录器暴露到全局
  if (typeof window !== 'undefined') {
    (window as any).__errorMonitoring = monitoring;
  }

  return monitoring;
}
```

### 🔧 API错误处理优化

#### 统一的API客户端

```typescript
// utils/apiClient.ts
import { AppError, ErrorType, NetworkError, AIModelError } from '@/types/errors';

interface APIClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  enableCircuitBreaker: boolean;
}

class APIClient {
  private config: APIClientConfig;
  private requestInterceptors: Array<(config: RequestInit) => RequestInit> = [];
  private responseInterceptors: Array<(response: Response) => Response | Promise<Response>> = [];

  constructor(config: Partial<APIClientConfig> = {}) {
    this.config = {
      baseURL: '',
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      enableCircuitBreaker: true,
      ...config
    };
  }

  // 添加请求拦截器
  addRequestInterceptor(interceptor: (config: RequestInit) => RequestInit) {
    this.requestInterceptors.push(interceptor);
  }

  // 添加响应拦截器
  addResponseInterceptor(interceptor: (response: Response) => Response | Promise<Response>) {
    this.responseInterceptors.push(interceptor);
  }

  // 创建AbortController处理超时
  private createTimeoutController(timeout: number): AbortController {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller;
  }

  // 处理HTTP错误
  private handleHTTPError(response: Response): never {
    const { status, statusText } = response;

    switch (status) {
      case 400:
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          `Bad Request: ${statusText}`,
          '请求参数有误，请检查输入',
          { code: 'HTTP_400', retryable: false }
        );
      
      case 401:
        throw new AppError(
          ErrorType.AUTHENTICATION_ERROR,
          `Unauthorized: ${statusText}`,
          '身份验证失败，请重新登录',
          { code: 'HTTP_401', retryable: false }
        );
      
      case 403:
        throw new AppError(
          ErrorType.AUTHORIZATION_ERROR,
          `Forbidden: ${statusText}`,
          '没有访问权限',
          { code: 'HTTP_403', retryable: false }
        );
      
      case 404:
        throw new AppError(
          ErrorType.API_ERROR,
          `Not Found: ${statusText}`,
          '请求的资源不存在',
          { code: 'HTTP_404', retryable: false }
        );
      
      case 429:
        throw new AppError(
          ErrorType.RATE_LIMIT_ERROR,
          `Too Many Requests: ${statusText}`,
          '请求过于频繁，请稍后重试',
          { code: 'HTTP_429', retryable: true }
        );
      
      case 500:
      case 502:
      case 503:
      case 504:
        throw new AppError(
          ErrorType.API_ERROR,
          `Server Error: ${status} ${statusText}`,
          '服务器暂时不可用，请稍后重试',
          { code: `HTTP_${status}`, retryable: true }
        );
      
      default:
        throw new AppError(
          ErrorType.API_ERROR,
          `HTTP Error: ${status} ${statusText}`,
          '网络请求失败，请稍后重试',
          { code: `HTTP_${status}`, retryable: status >= 500 }
        );
    }
  }

  // 执行请求（带重试）
  private async executeRequest<T>(
    url: string, 
    options: RequestInit, 
    attempt: number = 1
  ): Promise<T> {
    try {
      // 应用请求拦截器
      let processedOptions = { ...options };
      for (const interceptor of this.requestInterceptors) {
        processedOptions = interceptor(processedOptions);
      }

      // 添加超时控制
      const controller = this.createTimeoutController(this.config.timeout);
      processedOptions.signal = controller.signal;

      // 发送请求
      let response = await fetch(`${this.config.baseURL}${url}`, processedOptions);

      // 应用响应拦截器
      for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response);
      }

      // 检查响应状态
      if (!response.ok) {
        this.handleHTTPError(response);
      }

      // 解析响应
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text() as T;
      }

    } catch (error) {
      // 处理网络错误
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new AppError(
          ErrorType.TIMEOUT_ERROR,
          'Request timeout',
          '请求超时，请检查网络连接',
          { code: 'REQUEST_TIMEOUT', retryable: true }
        );
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError('Network connection failed', {
          code: 'NETWORK_FAILED',
          context: { url, attempt }
        });
      }

      // 重试逻辑
      if (error instanceof AppError && error.retryable && attempt < this.config.retries) {
        console.log(`🔄 Retrying request (attempt ${attempt + 1}/${this.config.retries}):`, url);
        
        // 指数退避延迟
        const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.executeRequest<T>(url, options, attempt + 1);
      }

      throw error;
    }
  }

  // GET请求
  async get<T = any>(url: string, config?: RequestInit): Promise<T> {
    return this.executeRequest<T>(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers
      },
      ...config
    });
  }

  // POST请求
  async post<T = any>(url: string, data?: any, config?: RequestInit): Promise<T> {
    return this.executeRequest<T>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers
      },
      body: data ? JSON.stringify(data) : undefined,
      ...config
    });
  }

  // PUT请求
  async put<T = any>(url: string, data?: any, config?: RequestInit): Promise<T> {
    return this.executeRequest<T>(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers
      },
      body: data ? JSON.stringify(data) : undefined,
      ...config
    });
  }

  // DELETE请求
  async delete<T = any>(url: string, config?: RequestInit): Promise<T> {
    return this.executeRequest<T>(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers
      },
      ...config
    });
  }

  // 流式请求（用于AI响应）
  async stream(url: string, data?: any, config?: RequestInit): Promise<ReadableStream> {
    try {
      let processedOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config?.headers
        },
        body: data ? JSON.stringify(data) : undefined,
        ...config
      };

      // 应用请求拦截器
      for (const interceptor of this.requestInterceptors) {
        processedOptions = interceptor(processedOptions);
      }

      const response = await fetch(`${this.config.baseURL}${url}`, processedOptions);

      if (!response.ok) {
        this.handleHTTPError(response);
      }

      if (!response.body) {
        throw new AIModelError('No response body for stream');
      }

      return response.body;
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      throw new AIModelError('Stream request failed', {
        context: { url, error: error.message }
      });
    }
  }
}

// 创建默认API客户端实例
export const apiClient = new APIClient({
  baseURL: '',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000
});

// 添加认证拦截器
apiClient.addRequestInterceptor((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  return config;
});

// 添加响应错误拦截器
apiClient.addResponseInterceptor(async (response) => {
  if (response.status === 401) {
    // 清除认证信息
    localStorage.removeItem('auth_token');
    // 重定向到登录页面（如果需要）
    // window.location.href = '/login';
  }
  return response;
});
```

---

## 🧪 测试错误处理

### 错误处理测试

```typescript
// __tests__/errorHandling.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useNotifications, NotificationProvider } from '@/contexts/NotificationContext';
import { AppError, ErrorType, ErrorSeverity } from '@/types/errors';

// 模拟组件，用于测试错误边界
const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  test('captures and displays errors', () => {
    const mockOnError = jest.fn();
    
    render(
      <ErrorBoundary onError={mockOnError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('应用出现异常')).toBeInTheDocument();
    expect(mockOnError).toHaveBeenCalled();
  });

  test('allows retry functionality', async () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('应用出现异常')).toBeInTheDocument();

    // 修复错误条件并重试
    const retryButton = screen.getByText('重新加载');
    
    // 模拟修复错误
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });
});

describe('NotificationSystem', () => {
  test('displays error notifications', () => {
    const TestComponent = () => {
      const { showError } = useNotifications();
      
      const handleError = () => {
        const error = new AppError(
          ErrorType.NETWORK_ERROR,
          'Network failed',
          '网络连接失败',
          { retryable: true }
        );
        showError(error);
      };

      return <button onClick={handleError}>Trigger Error</button>;
    };

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByText('Trigger Error'));

    expect(screen.getByText('操作失败')).toBeInTheDocument();
    expect(screen.getByText('网络连接失败')).toBeInTheDocument();
    expect(screen.getByText('重试')).toBeInTheDocument();
  });
});

// API客户端错误处理测试
describe('APIClient Error Handling', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  test('handles network errors', async () => {
    (fetch as jest.Mock).mockRejectedValue(new TypeError('Network error'));

    const { apiCall } = useApiWithRetry('/test/endpoint');

    await expect(apiCall()).rejects.toThrow(NetworkError);
  });

  test('handles HTTP errors', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    const { apiCall } = useApiWithRetry('/test/endpoint');

    await expect(apiCall()).rejects.toThrow(AppError);
  });

  test('retries failed requests', async () => {
    (fetch as jest.Mock)
      .mockRejectedValueOnce(new TypeError('Network error'))
      .mockRejectedValueOnce(new TypeError('Network error'))
      .mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });

    const { apiCall } = useApiWithRetry('/test/endpoint');

    const result = await apiCall();
    expect(result).toEqual({ success: true });
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});
```

---

## 🎯 实践任务

### 基础任务

1. **错误类型定义**
   - [ ] 创建完整的错误类型枚举
   - [ ] 实现AppError基类
   - [ ] 定义具体错误类型

2. **错误边界实现**
   - [ ] 创建ErrorBoundary组件
   - [ ] 实现错误日志记录
   - [ ] 添加自动恢复机制

3. **通知系统**
   - [ ] 实现错误通知组件
   - [ ] 创建用户友好的错误信息
   - [ ] 添加重试功能

### 进阶任务

1. **智能重试机制**
   - [ ] 实现指数退避算法
   - [ ] 添加断路器模式
   - [ ] 创建重试Hook

2. **错误监控**
   - [ ] 实现错误统计和分析
   - [ ] 添加性能监控
   - [ ] 创建错误报告系统

3. **API错误处理**
   - [ ] 创建统一的API客户端
   - [ ] 实现请求拦截器
   - [ ] 添加响应错误处理

---

## 📚 相关资源

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [JavaScript错误处理](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [Fetch API错误处理](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [Sentry错误监控](https://docs.sentry.io/)
- [断路器模式](https://martinfowler.com/bliki/CircuitBreaker.html)

---

这样就完成了第8章第4节的内容。现在让我创建第8章的PPT文件。
