# 7.3 交互功能实现

## 🎯 学习目标

- 实现丰富的键盘快捷键和手势操作
- 掌握流畅的动画过渡和微交互设计
- 建立完善的用户反馈和状态指示系统
- 优化交互响应时间和用户体验

## 📚 核心内容深度讲解

### 现代交互设计原则

在这个小节中，我们将实现让用户感到愉悦和高效的交互功能。优秀的交互设计应该是自然、直观、有反馈的，用户无需思考就能完成操作。

#### 交互设计核心原则
- **即时反馈**：每个操作都要有清晰的视觉反馈
- **渐进增强**：基础功能先行，高级交互作为补充
- **一致性**：相同类型的操作有相同的交互模式
- **可预测性**：用户能够预期操作的结果

### 交互层次设计

我们需要为聊天应用设计多层次的交互体验：

#### 交互层次架构
```
基础交互层：核心操作
├── 消息发送：Enter键、点击按钮
├── 消息滚动：自动滚动、手动滚动
└── 会话切换：点击选择、键盘导航

增强交互层：效率提升
├── 快捷键：Ctrl+N新会话、Ctrl+/搜索
├── 拖拽操作：文件上传、消息排序
└── 手势操作：滑动切换、长按操作

高级交互层：体验优化
├── 微交互：悬停效果、点击波纹
├── 动画过渡：页面切换、状态变化
└── 智能预测：输入建议、自动完成
```

## 💻 代码实战演示

### 键盘快捷键系统

#### 全局快捷键管理
```typescript
// app/hooks/useKeyboardShortcuts.ts
import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  callback: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const matchedShortcut = shortcuts.find(shortcut => {
      return (
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.altKey === event.altKey &&
        !!shortcut.shiftKey === event.shiftKey
      );
    });

    if (matchedShortcut) {
      event.preventDefault();
      matchedShortcut.callback();
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}

// 聊天应用的快捷键配置
export function useChatShortcuts({
  onNewSession,
  onToggleSidebar,
  onFocusInput,
  onSearchMessages,
  onToggleTheme
}: {
  onNewSession: () => void;
  onToggleSidebar: () => void;
  onFocusInput: () => void;
  onSearchMessages: () => void;
  onToggleTheme: () => void;
}) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'n',
      ctrlKey: true,
      callback: onNewSession,
      description: '新建会话'
    },
    {
      key: 'b',
      ctrlKey: true,
      callback: onToggleSidebar,
      description: '切换侧边栏'
    },
    {
      key: '/',
      ctrlKey: true,
      callback: onSearchMessages,
      description: '搜索消息'
    },
    {
      key: 'k',
      ctrlKey: true,
      callback: onFocusInput,
      description: '聚焦输入框'
    },
    {
      key: 'd',
      ctrlKey: true,
      shiftKey: true,
      callback: onToggleTheme,
      description: '切换主题'
    },
    {
      key: 'Escape',
      callback: () => {
        // 取消当前操作或关闭模态框
        const activeElement = document.activeElement as HTMLElement;
        activeElement?.blur();
      },
      description: '取消操作'
    }
  ];

  return useKeyboardShortcuts(shortcuts);
}
```

### 动画和过渡效果

#### 消息进入动画
```typescript
// app/components/animations/MessageAnimation.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@/app/types';

interface MessageAnimationProps {
  message: Message;
  children: React.ReactNode;
  delay?: number;
}

export function MessageAnimation({ 
  message, 
  children, 
  delay = 0 
}: MessageAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const isUser = message.role === 'user';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
            x: isUser ? 20 : -20,
            scale: 0.95
          }}
          animate={{
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1
          }}
          exit={{
            opacity: 0,
            y: -20,
            scale: 0.95
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8
          }}
          layout
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 流式文字动画
export function TypewriterText({ 
  text, 
  speed = 50 
}: { 
  text: string; 
  speed?: number; 
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return (
    <span>
      {displayedText}
      {currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-0.5 h-4 bg-current ml-1"
        />
      )}
    </span>
  );
}
```

#### 页面切换动画
```typescript
// app/components/animations/PageTransition.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  routeKey: string;
}

export function PageTransition({ children, routeKey }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// 模态框动画
export function ModalAnimation({ 
  isOpen, 
  onClose, 
  children 
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* 模态框内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### 微交互效果

#### 按钮交互效果
```typescript
// app/components/ui/InteractiveButton.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/app/utils/cn';

interface InteractiveButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function InteractiveButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className
}: InteractiveButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // 创建点击波纹效果
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);

    // 清理波纹
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    onClick?.();
  };

  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm hover:shadow-md',
    ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <motion.button
      className={cn(
        'relative overflow-hidden rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      onClick={handleClick}
      disabled={disabled || loading}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      animate={{
        scale: isPressed ? 0.95 : 1
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* 波纹效果 */}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      ))}

      {/* 按钮内容 */}
      <span className="relative z-10 flex items-center justify-center space-x-2">
        {loading && (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        <span>{children}</span>
      </span>
    </motion.button>
  );
}
```

#### 输入框焦点效果
```typescript
// app/components/ui/AnimatedInput.tsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/app/utils/cn';

interface AnimatedInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  className?: string;
}

export function AnimatedInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  error,
  label,
  className
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasValue = value.length > 0;
  const shouldFloatLabel = isFocused || hasValue;

  return (
    <div className={cn('relative', className)}>
      {/* 输入框 */}
      <motion.div
        className={cn(
          'relative border rounded-lg transition-all duration-200',
          isFocused ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-slate-300',
          error ? 'border-red-500' : '',
          disabled ? 'bg-slate-50 opacity-60' : 'bg-white'
        )}
        layout
      >
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-3 bg-transparent outline-none',
            label ? 'pt-6 pb-2' : '',
            disabled ? 'cursor-not-allowed' : ''
          )}
          placeholder={!label ? placeholder : ''}
        />

        {/* 浮动标签 */}
        {label && (
          <motion.label
            className={cn(
              'absolute left-4 pointer-events-none transition-all duration-200',
              shouldFloatLabel ? 'top-2 text-xs' : 'top-1/2 -translate-y-1/2 text-sm',
              isFocused ? 'text-blue-500' : 'text-slate-500',
              error ? 'text-red-500' : ''
            )}
            onClick={() => inputRef.current?.focus()}
            animate={{
              y: shouldFloatLabel ? 0 : 0,
              scale: shouldFloatLabel ? 0.85 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {label}
          </motion.label>
        )}

        {/* 焦点指示线 */}
        <motion.div
          className={cn(
            'absolute bottom-0 left-0 h-0.5 bg-blue-500',
            error ? 'bg-red-500' : ''
          )}
          initial={{ width: 0 }}
          animate={{ width: isFocused ? '100%' : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      {/* 错误信息 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1 text-sm text-red-500"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### 手势操作支持

#### 触摸手势处理
```typescript
// app/hooks/useGestures.ts
import { useEffect, useRef } from 'react';

interface GestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
}

export function useGestures(handlers: GestureHandlers) {
  const elementRef = useRef<HTMLElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };

      // 长按检测
      if (handlers.onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          handlers.onLongPress?.();
        }, 500);
      }
    };

    const handleTouchMove = () => {
      // 取消长按
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // 取消长按
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // 双击检测
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 300) {
        const now = Date.now();
        if (now - lastTapRef.current < 300) {
          handlers.onDoubleTap?.();
        }
        lastTapRef.current = now;
      }

      // 滑动检测
      const minSwipeDistance = 50;
      if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // 水平滑动
          if (deltaX > 0) {
            handlers.onSwipeRight?.();
          } else {
            handlers.onSwipeLeft?.();
          }
        } else {
          // 垂直滑动
          if (deltaY > 0) {
            handlers.onSwipeDown?.();
          } else {
            handlers.onSwipeUp?.();
          }
        }
      }

      touchStartRef.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [handlers]);

  return elementRef;
}

// 使用示例
function SwipeableMessageList() {
  const gestureRef = useGestures({
    onSwipeLeft: () => console.log('向左滑动'),
    onSwipeRight: () => console.log('向右滑动'),
    onLongPress: () => console.log('长按消息'),
    onDoubleTap: () => console.log('双击消息')
  });

  return (
    <div ref={gestureRef} className="h-full overflow-y-auto">
      {/* 消息列表内容 */}
    </div>
  );
}
```

## 🔧 实践指导

### 性能优化策略

#### 动画性能优化
```typescript
// app/utils/performance.ts
export const animationConfig = {
  // 减少动画复杂度
  reduceMotion: typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  
  // 性能友好的动画配置
  spring: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    mass: 0.8
  },
  
  // 快速动画配置
  fast: {
    duration: 0.2,
    ease: "easeOut" as const
  },
  
  // 慢速动画配置
  slow: {
    duration: 0.5,
    ease: "easeInOut" as const
  }
};

// 性能监控Hook
export function usePerformanceMonitor() {
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    function measureFPS() {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        if (fps < 30) {
          console.warn('低帧率检测:', fps, 'FPS');
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    }
    
    requestAnimationFrame(measureFPS);
  }, []);
}
```

### 可访问性增强

#### 键盘导航支持
```typescript
// app/hooks/useKeyboardNavigation.ts
export function useKeyboardNavigation(
  items: any[], 
  onSelect: (item: any, index: number) => void
) {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < items.length - 1 ? prev + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : items.length - 1
        );
        break;
        
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          onSelect(items[focusedIndex], focusedIndex);
        }
        break;
        
      case 'Escape':
        setFocusedIndex(-1);
        break;
    }
  }, [items, focusedIndex, onSelect]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { focusedIndex, setFocusedIndex };
}
```

## 📋 知识点总结

- **键盘快捷键**：高效的键盘操作系统
- **动画过渡**：流畅自然的视觉效果
- **微交互**：细致的用户反馈机制
- **手势操作**：触摸设备的交互支持
- **性能优化**：保证交互流畅性

## 🚀 下一步展望

完成了交互功能实现后，我们将学习7.4小节的组件优化，包括性能优化、可访问性提升、组件复用等，让我们的界面组件更加专业和可维护。

