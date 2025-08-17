# 8.2 SessionSidebar组件实现 🎨

> 构建高质量的会话侧边栏组件，实现会话列表展示、切换、管理等交互功能

---

## 🎯 学习目标

完成本节学习后，学员将能够：

- **设计现代化的React组件架构**：掌握组件拆分、Props设计和状态管理
- **实现复杂的用户交互逻辑**：处理会话切换、重命名、删除等操作
- **优化组件性能和用户体验**：使用React优化技巧和流畅的动画效果
- **集成API数据和状态同步**：处理异步数据获取和组件状态更新
- **构建可复用的UI组件**：建立组件设计模式和最佳实践

---

## 📚 核心知识点

### 🎨 组件设计架构

#### 组件Props接口设计

```typescript
// SessionSidebar组件的Props接口
interface SessionSidebarProps {
  currentSessionId: string;              // 当前激活的会话ID
  onSelect: (sessionId: string) => void; // 会话选择回调
  onNew: (sessionId: string) => void;    // 新建会话回调
  onDelete?: (sessionId: string) => void; // 删除会话回调（可选）
  onRename?: (sessionId: string, newName: string) => void; // 重命名回调（可选）
  className?: string;                    // 自定义样式类名
  isCollapsed?: boolean;                 // 是否折叠状态
  onToggleCollapse?: () => void;         // 切换折叠状态回调
}

// 会话项数据接口
interface SessionItemProps {
  session: Session;                      // 会话数据
  isActive: boolean;                     // 是否为当前激活会话
  isEditing: boolean;                    // 是否处于编辑状态
  onSelect: () => void;                  // 选择回调
  onEdit: () => void;                    // 开始编辑回调
  onSave: (newName: string) => void;     // 保存编辑回调
  onCancel: () => void;                  // 取消编辑回调
  onDelete: () => void;                  // 删除回调
}

// 组件内部状态接口
interface SessionSidebarState {
  sessions: Session[];                   // 会话列表
  loading: boolean;                      // 加载状态
  error: string | null;                 // 错误信息
  editingId: string | null;             // 正在编辑的会话ID
  editingName: string;                   // 编辑中的名称
  showDeleteConfirm: string | null;     // 显示删除确认的会话ID
}
```

#### 组件层次结构

```
SessionSidebar (主组件)
├── SidebarHeader (头部区域)
│   ├── 新建会话按钮
│   └── 折叠/展开按钮
├── SessionList (会话列表)
│   └── SessionItem[] (会话项数组)
│       ├── SessionIcon (会话图标)
│       ├── SessionName (会话名称)
│       ├── SessionActions (操作按钮)
│       └── SessionEditForm (编辑表单)
└── SidebarFooter (底部区域)
    ├── 设置按钮
    └── 帮助链接
```

### 🔧 主组件实现

#### SessionSidebar主组件

```typescript
// app/components/SessionSidebar.tsx
import React, { useState, useEffect, useCallback, useMemo, forwardRef } from 'react';
import { PlusIcon, ChatBubbleLeftIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { Session } from '@/app/types/session';

const SessionSidebar = forwardRef<HTMLDivElement, SessionSidebarProps>(
  function SessionSidebar(
    { 
      currentSessionId, 
      onSelect, 
      onNew,
      onDelete,
      onRename,
      className = '',
      isCollapsed = false,
      onToggleCollapse
    }: SessionSidebarProps,
    ref
  ) {
    // 组件状态
    const [state, setState] = useState<SessionSidebarState>({
      sessions: [],
      loading: true,
      error: null,
      editingId: null,
      editingName: '',
      showDeleteConfirm: null
    });

    // 解构状态便于使用
    const { sessions, loading, error, editingId, editingName, showDeleteConfirm } = state;

    // 更新状态的工具函数
    const updateState = useCallback((updates: Partial<SessionSidebarState>) => {
      setState(prev => ({ ...prev, ...updates }));
    }, []);

    // 获取会话列表
    const fetchSessions = useCallback(async () => {
      try {
        updateState({ loading: true, error: null });
        
        const response = await fetch('/api/chat/sessions');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data.sessions)) {
          updateState({ 
            sessions: data.sessions,
            loading: false 
          });
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('获取会话列表失败:', error);
        updateState({ 
          error: error instanceof Error ? error.message : '获取会话列表失败',
          loading: false 
        });
      }
    }, [updateState]);

    // 组件挂载时获取会话列表
    useEffect(() => {
      fetchSessions();
    }, [fetchSessions]);

    // 创建新会话
    const handleCreateSession = useCallback(async () => {
      try {
        updateState({ loading: true });
        
        const response = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: '' }) // 空名称将生成默认名称
        });
        
        if (!response.ok) {
          throw new Error('创建会话失败');
        }
        
        const newSession = await response.json();
        
        // 调用父组件的回调
        onNew(newSession.id);
        
        // 刷新会话列表
        await fetchSessions();
      } catch (error) {
        console.error('创建会话失败:', error);
        updateState({ 
          error: error instanceof Error ? error.message : '创建会话失败',
          loading: false 
        });
      }
    }, [onNew, fetchSessions, updateState]);

    // 开始编辑会话名称
    const handleStartEdit = useCallback((sessionId: string, currentName: string) => {
      updateState({
        editingId: sessionId,
        editingName: currentName
      });
    }, [updateState]);

    // 保存编辑
    const handleSaveEdit = useCallback(async () => {
      if (!editingId || !editingName.trim()) return;

      try {
        const response = await fetch('/api/chat/sessions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: editingId, 
            name: editingName.trim(),
            action: 'rename'
          })
        });

        if (!response.ok) {
          throw new Error('重命名失败');
        }

        // 调用父组件的回调
        onRename?.(editingId, editingName.trim());

        // 更新本地状态
        updateState({
          sessions: sessions.map(session =>
            session.id === editingId
              ? { ...session, name: editingName.trim() }
              : session
          ),
          editingId: null,
          editingName: ''
        });
      } catch (error) {
        console.error('重命名会话失败:', error);
        updateState({ error: '重命名失败' });
      }
    }, [editingId, editingName, sessions, onRename, updateState]);

    // 取消编辑
    const handleCancelEdit = useCallback(() => {
      updateState({
        editingId: null,
        editingName: ''
      });
    }, [updateState]);

    // 删除会话
    const handleDeleteSession = useCallback(async (sessionId: string) => {
      try {
        const response = await fetch('/api/chat/sessions', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: sessionId })
        });

        if (!response.ok) {
          throw new Error('删除失败');
        }

        // 调用父组件的回调
        onDelete?.(sessionId);

        // 更新本地状态
        updateState({
          sessions: sessions.filter(session => session.id !== sessionId),
          showDeleteConfirm: null
        });
      } catch (error) {
        console.error('删除会话失败:', error);
        updateState({ error: '删除失败' });
      }
    }, [sessions, onDelete, updateState]);

    // 显示删除确认
    const handleShowDeleteConfirm = useCallback((sessionId: string) => {
      updateState({ showDeleteConfirm: sessionId });
    }, [updateState]);

    // 隐藏删除确认
    const handleHideDeleteConfirm = useCallback(() => {
      updateState({ showDeleteConfirm: null });
    }, [updateState]);

    // 计算样式类名
    const sidebarClasses = useMemo(() => {
      const base = "flex flex-col h-full bg-gray-900 border-r border-gray-700";
      const width = isCollapsed ? "w-16" : "w-80";
      const transition = "transition-all duration-300 ease-in-out";
      
      return `${base} ${width} ${transition} ${className}`;
    }, [isCollapsed, className]);

    // 错误显示组件
    const ErrorDisplay = ({ message }: { message: string }) => (
      <div className="p-4 text-center">
        <p className="text-red-400 text-sm">{message}</p>
        <button
          onClick={fetchSessions}
          className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
        >
          重试
        </button>
      </div>
    );

    // 加载状态组件
    const LoadingDisplay = () => (
      <div className="p-4 text-center">
        <div className="flex justify-center items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        {!isCollapsed && (
          <p className="text-gray-400 text-sm mt-2">加载中...</p>
        )}
      </div>
    );

    return (
      <div ref={ref} className={sidebarClasses}>
        {/* 侧边栏头部 */}
        <SidebarHeader
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          onCreateSession={handleCreateSession}
          loading={loading}
        />

        {/* 会话列表容器 */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <LoadingDisplay />
          ) : error ? (
            <ErrorDisplay message={error} />
          ) : sessions.length === 0 ? (
            <EmptyState 
              isCollapsed={isCollapsed}
              onCreateSession={handleCreateSession}
            />
          ) : (
            <SessionList
              sessions={sessions}
              currentSessionId={currentSessionId}
              editingId={editingId}
              editingName={editingName}
              showDeleteConfirm={showDeleteConfirm}
              isCollapsed={isCollapsed}
              onSelect={onSelect}
              onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onEditNameChange={(name) => updateState({ editingName: name })}
              onShowDeleteConfirm={handleShowDeleteConfirm}
              onHideDeleteConfirm={handleHideDeleteConfirm}
              onDeleteSession={handleDeleteSession}
            />
          )}
        </div>

        {/* 侧边栏底部 */}
        <SidebarFooter isCollapsed={isCollapsed} />
      </div>
    );
  }
);

export default SessionSidebar;
```

### 🎨 子组件实现

#### SidebarHeader组件

```typescript
// app/components/SessionSidebar/SidebarHeader.tsx
interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
  onCreateSession: () => void;
  loading: boolean;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isCollapsed,
  onToggleCollapse,
  onCreateSession,
  loading
}) => {
  return (
    <div className="p-4 border-b border-gray-700">
      <div className="flex items-center justify-between">
        {/* 折叠/展开按钮 */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title={isCollapsed ? '展开侧边栏' : '折叠侧边栏'}
          >
            <svg
              className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* 标题 */}
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-white flex-1 text-center">
            会话历史
          </h2>
        )}

        {/* 新建会话按钮 */}
        <button
          onClick={onCreateSession}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="新建会话"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>

      {/* 搜索框（非折叠状态下显示） */}
      {!isCollapsed && (
        <div className="mt-3">
          <SearchInput placeholder="搜索会话..." />
        </div>
      )}
    </div>
  );
};
```

#### SessionList组件

```typescript
// app/components/SessionSidebar/SessionList.tsx
interface SessionListProps {
  sessions: Session[];
  currentSessionId: string;
  editingId: string | null;
  editingName: string;
  showDeleteConfirm: string | null;
  isCollapsed: boolean;
  onSelect: (sessionId: string) => void;
  onStartEdit: (sessionId: string, currentName: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditNameChange: (name: string) => void;
  onShowDeleteConfirm: (sessionId: string) => void;
  onHideDeleteConfirm: () => void;
  onDeleteSession: (sessionId: string) => void;
}

const SessionList: React.FC<SessionListProps> = ({
  sessions,
  currentSessionId,
  editingId,
  editingName,
  showDeleteConfirm,
  isCollapsed,
  onSelect,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditNameChange,
  onShowDeleteConfirm,
  onHideDeleteConfirm,
  onDeleteSession
}) => {
  return (
    <div className="py-2">
      {sessions.map((session) => (
        <SessionItem
          key={session.id}
          session={session}
          isActive={session.id === currentSessionId}
          isEditing={editingId === session.id}
          isCollapsed={isCollapsed}
          editingName={editingName}
          showDeleteConfirm={showDeleteConfirm === session.id}
          onSelect={() => onSelect(session.id)}
          onStartEdit={() => onStartEdit(session.id, session.name)}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          onEditNameChange={onEditNameChange}
          onShowDeleteConfirm={() => onShowDeleteConfirm(session.id)}
          onHideDeleteConfirm={onHideDeleteConfirm}
          onDeleteSession={() => onDeleteSession(session.id)}
        />
      ))}
    </div>
  );
};
```

#### SessionItem组件

```typescript
// app/components/SessionSidebar/SessionItem.tsx
interface SessionItemProps {
  session: Session;
  isActive: boolean;
  isEditing: boolean;
  isCollapsed: boolean;
  editingName: string;
  showDeleteConfirm: boolean;
  onSelect: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditNameChange: (name: string) => void;
  onShowDeleteConfirm: () => void;
  onHideDeleteConfirm: () => void;
  onDeleteSession: () => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  session,
  isActive,
  isEditing,
  isCollapsed,
  editingName,
  showDeleteConfirm,
  onSelect,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditNameChange,
  onShowDeleteConfirm,
  onHideDeleteConfirm,
  onDeleteSession
}) => {
  const [showActions, setShowActions] = useState(false);

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSaveEdit();
    } else if (e.key === 'Escape') {
      onCancelEdit();
    }
  };

  // 格式化时间显示
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      return '刚刚';
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}小时前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // 计算样式类名
  const itemClasses = useMemo(() => {
    const base = "group relative px-3 py-2 mx-2 rounded-lg cursor-pointer transition-all duration-200";
    const activeStyles = isActive 
      ? "bg-blue-600 text-white" 
      : "text-gray-300 hover:bg-gray-800 hover:text-white";
    
    return `${base} ${activeStyles}`;
  }, [isActive]);

  return (
    <div
      className={itemClasses}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={!isEditing ? onSelect : undefined}
    >
      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          sessionName={session.name}
          onConfirm={onDeleteSession}
          onCancel={onHideDeleteConfirm}
        />
      )}

      <div className="flex items-center">
        {/* 会话图标 */}
        <div className="flex-shrink-0">
          <ChatBubbleLeftIcon className="w-5 h-5" />
        </div>

        {/* 会话名称区域 */}
        {!isCollapsed && (
          <div className="flex-1 ml-3 min-w-0">
            {isEditing ? (
              /* 编辑模式 */
              <input
                type="text"
                value={editingName}
                onChange={(e) => onEditNameChange(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={onSaveEdit}
                className="w-full px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                autoFocus
                maxLength={50}
              />
            ) : (
              /* 显示模式 */
              <div>
                <div className="text-sm font-medium truncate" title={session.name}>
                  {session.name}
                </div>
                <div className="text-xs text-gray-400 mt-1 flex items-center space-x-2">
                  <span>{formatTime(session.createdAt)}</span>
                  {session.messageCount !== undefined && (
                    <>
                      <span>•</span>
                      <span>{session.messageCount} 条消息</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 操作按钮区域 */}
        {!isCollapsed && !isEditing && (showActions || isActive) && (
          <div className="flex-shrink-0 ml-2">
            <SessionActions
              onEdit={onStartEdit}
              onDelete={onShowDeleteConfirm}
            />
          </div>
        )}
      </div>

      {/* 激活状态指示器 */}
      {isActive && (
        <div className="absolute left-0 top-0 w-1 h-full bg-blue-400 rounded-r-full" />
      )}
    </div>
  );
};
```

#### SessionActions组件

```typescript
// app/components/SessionSidebar/SessionActions.tsx
interface SessionActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

const SessionActions: React.FC<SessionActionsProps> = ({ onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-all"
      >
        <EllipsisVerticalIcon className="w-4 h-4" />
      </button>

      {showMenu && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          
          {/* 下拉菜单 */}
          <div className="absolute right-0 top-full mt-1 w-32 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors rounded-t-lg"
            >
              重命名
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-600 hover:text-white transition-colors rounded-b-lg"
            >
              删除
            </button>
          </div>
        </>
      )}
    </div>
  );
};
```

### 🎨 辅助组件

#### 删除确认弹窗

```typescript
// app/components/SessionSidebar/DeleteConfirmModal.tsx
interface DeleteConfirmModalProps {
  sessionName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  sessionName,
  onConfirm,
  onCancel
}) => {
  return (
    <>
      {/* 遮罩层 */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-sm mx-4">
          <h3 className="text-lg font-semibold text-white mb-2">
            确认删除
          </h3>
          <p className="text-gray-300 mb-4">
            确定要删除会话 "<span className="font-medium">{sessionName}</span>" 吗？
            此操作无法撤销。
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
```

#### 空状态组件

```typescript
// app/components/SessionSidebar/EmptyState.tsx
interface EmptyStateProps {
  isCollapsed: boolean;
  onCreateSession: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ isCollapsed, onCreateSession }) => {
  if (isCollapsed) {
    return (
      <div className="p-4 text-center">
        <ChatBubbleLeftIcon className="w-8 h-8 text-gray-500 mx-auto" />
      </div>
    );
  }

  return (
    <div className="p-6 text-center">
      <ChatBubbleLeftIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-300 mb-2">
        暂无会话
      </h3>
      <p className="text-gray-400 text-sm mb-4">
        开始您的第一次对话吧！
      </p>
      <button
        onClick={onCreateSession}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        新建会话
      </button>
    </div>
  );
};
```

#### 搜索输入框

```typescript
// app/components/SessionSidebar/SearchInput.tsx
interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ 
  placeholder = "搜索...", 
  onSearch 
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full px-3 py-2 pl-9 text-sm bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-gray-300 placeholder-gray-500"
      />
      <svg
        className={`absolute left-3 top-2.5 w-4 h-4 transition-colors ${
          isFocused ? 'text-blue-500' : 'text-gray-500'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      {query && (
        <button
          onClick={() => {
            setQuery('');
            onSearch?.('');
          }}
          className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
```

---

## 🎨 样式和动画

### Tailwind CSS样式配置

```css
/* 自定义动画样式 */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

.slide-in {
  animation: slideIn 0.3s ease-out forwards;
}

.slide-out {
  animation: slideOut 0.3s ease-out forwards;
}

/* 自定义滚动条样式 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(55, 65, 81, 0.1);
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
```

### 组件动画实现

```typescript
// 使用Framer Motion实现复杂动画（可选）
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedSessionItem: React.FC<SessionItemProps> = (props) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <SessionItem {...props} />
    </motion.div>
  );
};

// 列表动画容器
const AnimatedSessionList: React.FC<SessionListProps> = (props) => {
  return (
    <AnimatePresence mode="popLayout">
      {props.sessions.map((session, index) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ 
            duration: 0.2, 
            delay: index * 0.05 // 错位动画
          }}
        >
          <SessionItem
            session={session}
            // ... 其他props
          />
        </motion.div>
      ))}
    </AnimatePresence>
  );
};
```

---

## 🔧 性能优化

### React优化技巧

```typescript
// 使用React.memo优化组件重渲染
const SessionItem = React.memo<SessionItemProps>(({
  session,
  isActive,
  isEditing,
  // ... 其他props
}) => {
  // 组件实现...
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return (
    prevProps.session.id === nextProps.session.id &&
    prevProps.session.name === nextProps.session.name &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.isEditing === nextProps.isEditing
  );
});

// 使用useMemo优化计算
const SessionSidebar = forwardRef<HTMLDivElement, SessionSidebarProps>(
  function SessionSidebar(props, ref) {
    // 缓存过滤后的会话列表
    const filteredSessions = useMemo(() => {
      if (!searchQuery) return sessions;
      
      return sessions.filter(session =>
        session.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [sessions, searchQuery]);

    // 缓存样式计算
    const sidebarStyles = useMemo(() => ({
      width: isCollapsed ? '64px' : '320px',
      transition: 'width 0.3s ease-in-out'
    }), [isCollapsed]);

    // ... 组件实现
  }
);

// 使用useCallback优化事件处理函数
const handleSessionSelect = useCallback((sessionId: string) => {
  // 避免不必要的会话切换
  if (sessionId === currentSessionId) return;
  
  onSelect(sessionId);
}, [currentSessionId, onSelect]);
```

### 虚拟滚动实现（大数据量）

```typescript
// 虚拟滚动组件（处理大量会话）
import { FixedSizeList as List } from 'react-window';

interface VirtualSessionListProps {
  sessions: Session[];
  height: number;
  itemHeight: number;
  // ... 其他props
}

const VirtualSessionList: React.FC<VirtualSessionListProps> = ({
  sessions,
  height,
  itemHeight,
  ...otherProps
}) => {
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const session = sessions[index];
    
    return (
      <div style={style}>
        <SessionItem
          session={session}
          {...otherProps}
        />
      </div>
    );
  }, [sessions, otherProps]);

  return (
    <List
      height={height}
      itemCount={sessions.length}
      itemSize={itemHeight}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

---

## 🧪 测试实现

### 组件单元测试

```typescript
// SessionSidebar.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SessionSidebar from '../SessionSidebar';

// Mock fetch API
global.fetch = jest.fn();

describe('SessionSidebar', () => {
  const mockProps = {
    currentSessionId: 'session-1',
    onSelect: jest.fn(),
    onNew: jest.fn(),
    onDelete: jest.fn(),
    onRename: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        sessions: [
          { id: 'session-1', name: '会话1', createdAt: '2024-01-01' },
          { id: 'session-2', name: '会话2', createdAt: '2024-01-02' }
        ]
      })
    });
  });

  test('renders session list correctly', async () => {
    render(<SessionSidebar {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('会话1')).toBeInTheDocument();
      expect(screen.getByText('会话2')).toBeInTheDocument();
    });
  });

  test('handles session selection', async () => {
    render(<SessionSidebar {...mockProps} />);
    
    await waitFor(() => {
      const sessionItem = screen.getByText('会话2');
      fireEvent.click(sessionItem);
    });

    expect(mockProps.onSelect).toHaveBeenCalledWith('session-2');
  });

  test('handles new session creation', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'new-session', name: '新会话' })
    });

    render(<SessionSidebar {...mockProps} />);
    
    const newButton = screen.getByTitle('新建会话');
    fireEvent.click(newButton);

    await waitFor(() => {
      expect(mockProps.onNew).toHaveBeenCalledWith('new-session');
    });
  });

  test('handles session rename', async () => {
    render(<SessionSidebar {...mockProps} />);
    
    await waitFor(() => {
      // 悬浮显示操作按钮
      const sessionItem = screen.getByText('会话1');
      fireEvent.mouseEnter(sessionItem.parentElement!);
      
      // 点击重命名
      const renameButton = screen.getByText('重命名');
      fireEvent.click(renameButton);
    });

    // 输入新名称
    const input = screen.getByDisplayValue('会话1');
    await userEvent.clear(input);
    await userEvent.type(input, '新名称');
    fireEvent.blur(input);

    await waitFor(() => {
      expect(mockProps.onRename).toHaveBeenCalledWith('session-1', '新名称');
    });
  });

  test('handles session deletion', async () => {
    render(<SessionSidebar {...mockProps} />);
    
    await waitFor(() => {
      // 悬浮显示操作按钮
      const sessionItem = screen.getByText('会话1');
      fireEvent.mouseEnter(sessionItem.parentElement!);
      
      // 点击删除
      const deleteButton = screen.getByText('删除');
      fireEvent.click(deleteButton);
    });

    // 确认删除
    const confirmButton = screen.getByText('删除');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockProps.onDelete).toHaveBeenCalledWith('session-1');
    });
  });
});
```

### 集成测试

```typescript
// SessionSidebar.integration.test.tsx
import { render, screen } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import SessionSidebar from '../SessionSidebar';

// 模拟API服务器
const server = setupServer(
  rest.get('/api/chat/sessions', (req, res, ctx) => {
    return res(
      ctx.json({
        sessions: [
          { id: '1', name: '测试会话1', createdAt: '2024-01-01' },
          { id: '2', name: '测试会话2', createdAt: '2024-01-02' }
        ]
      })
    );
  }),
  
  rest.post('/api/chat/sessions', (req, res, ctx) => {
    return res(
      ctx.json({ id: 'new-id', name: '新会话' })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('full session management workflow', async () => {
  const mockProps = {
    currentSessionId: '1',
    onSelect: jest.fn(),
    onNew: jest.fn()
  };

  render(<SessionSidebar {...mockProps} />);
  
  // 等待会话加载
  await waitFor(() => {
    expect(screen.getByText('测试会话1')).toBeInTheDocument();
  });

  // 测试新建会话流程
  fireEvent.click(screen.getByTitle('新建会话'));
  
  await waitFor(() => {
    expect(mockProps.onNew).toHaveBeenCalledWith('new-id');
  });
});
```

---

## 🎯 实践任务

### 基础任务

1. **组件结构搭建**
   - [ ] 创建SessionSidebar主组件文件
   - [ ] 实现基础的组件Props接口
   - [ ] 搭建组件的基础HTML结构

2. **会话列表功能**
   - [ ] 实现会话数据获取和显示
   - [ ] 添加会话选择和切换功能
   - [ ] 实现会话的基础样式

3. **交互功能实现**
   - [ ] 添加新建会话功能
   - [ ] 实现会话重命名功能
   - [ ] 添加会话删除功能

### 进阶任务

1. **用户体验优化**
   - [ ] 添加加载状态和错误处理
   - [ ] 实现流畅的动画效果
   - [ ] 优化响应式布局

2. **性能优化**
   - [ ] 使用React.memo优化重渲染
   - [ ] 实现虚拟滚动（大数据量）
   - [ ] 添加搜索和过滤功能

3. **高级功能**
   - [ ] 实现会话拖拽排序
   - [ ] 添加会话导入导出
   - [ ] 实现键盘快捷键支持

---

## 📚 相关资源

- [React官方文档 - Hooks](https://react.dev/reference/react)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Tailwind CSS官方文档](https://tailwindcss.com/docs)
- [Framer Motion动画库](https://www.framer.com/motion/)
- [React Window虚拟滚动](https://react-window.vercel.app/)

---

下一节：[8.3 UI和交互优化](../8.3-UI和交互优化/README.md)
