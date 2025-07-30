'use client';

import { useState, useEffect, useRef } from 'react';
import { FileTree } from './components/FileTree';
import { ContentViewer } from './components/ContentViewer';
import { ChatPanel } from './components/ChatPanel';
import { ProgressIndicator } from './components/ProgressIndicator';
import HistoryPanel from './components/HistoryPanel';
import { Clock } from 'lucide-react';

interface ResearchState {
  sessionId?: string;
  status: string;
  progress: number;
  question?: string;
  analysis?: any;
  plan?: any;
  tasks?: any[];
  currentTask?: number;
  totalTasks?: number;
  generatedContent?: any[];
  finalReport?: string;
  fileTree?: any;
  error?: string;
}

export default function DeepResearchPage() {
  const [researchState, setResearchState] = useState<ResearchState>({
    status: 'idle',
    progress: 0,
  });
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [currentUserId] = useState(() => {
    // 从localStorage获取用户ID，如果不存在则生成新的并保存
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('deepresearch_user_id');
      if (storedUserId) {
        return storedUserId;
      } else {
        const newUserId = 'user-' + Date.now();
        localStorage.setItem('deepresearch_user_id', newUserId);
        return newUserId;
      }
    }
    // 服务端渲染时的fallback
    return 'user-' + Date.now();
  });
  const eventSourceRef = useRef<EventSource | null>(null);

  // 开始研究
  const startResearch = async (question: string) => {
    if (isLoading) return;

    setIsLoading(true);
    setResearchState({
      status: 'starting',
      progress: 0,
      question,
    });
    setMessages([]);

    try {
      // 首先创建研究会话
      const response = await fetch('/api/deepresearch/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          userId: currentUserId, // 使用固定的用户ID
        }),
      });

      if (!response.ok) {
        throw new Error('启动研究失败');
      }

      const { sessionId } = await response.json();

      // 更新状态
      setResearchState((prev) => ({
        ...prev,
        sessionId,
      }));

      // 创建EventSource连接到流式端点
      const eventSource = new EventSource(
        `/api/deepresearch/stream/${sessionId}`
      );

      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleResearchUpdate(data);
        } catch (error) {
          console.error('解析SSE数据失败:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE连接错误:', error);
        setIsLoading(false);
        setResearchState((prev) => ({
          ...prev,
          status: 'error',
          error: '连接中断',
        }));
        eventSource.close();
      };
    } catch (error: any) {
      console.error('启动研究失败:', error);
      setIsLoading(false);
      setResearchState((prev) => ({
        ...prev,
        status: 'error',
        error: error.message,
      }));
    }
  };

  // 处理研究更新
  const handleResearchUpdate = (data: any) => {
    console.log('研究更新:', data);

    switch (data.type) {
      case 'session_created':
        setResearchState((prev) => ({
          ...prev,
          sessionId: data.sessionId,
          status: data.status,
          progress: data.progress,
        }));
        addMessage({
          type: 'system',
          content: `研究会话已创建，ID: ${data.sessionId}`,
          timestamp: new Date(),
        });
        break;

      case 'progress':
        setResearchState((prev) => ({
          ...prev,
          status: data.status,
          progress: data.progress,
          currentTask: data.currentTask,
          totalTasks: data.totalTasks,
          analysis: data.analysis,
          plan: data.plan,
          tasks: data.tasks,
          generatedContent: data.generatedContent,
          error: data.error,
        }));

        // 添加进度消息
        if (data.analysis) {
          addMessage({
            type: 'analysis',
            content: data.analysis,
            timestamp: new Date(),
          });
        }

        if (data.plan) {
          addMessage({
            type: 'plan',
            content: data.plan,
            timestamp: new Date(),
          });
        }

        if (data.generatedContent && data.generatedContent.length > 0) {
          console.log(
            '%c Line:162 🥐 data.generatedContent',
            'color:#3f7cff',
            data.generatedContent
          );
          data.generatedContent.forEach((content: any) => {
            addMessage({
              type: 'content',
              content,
              timestamp: new Date(),
            });
          });
        }
        break;

      case 'completed':
        setResearchState((prev) => ({
          ...prev,
          status: 'completed',
          progress: 100,
          finalReport: data.finalReport,
          fileTree: data.fileTree,
        }));
        setIsLoading(false);
        addMessage({
          type: 'system',
          content: '研究完成！',
          timestamp: new Date(),
        });

        // 关闭EventSource连接
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        break;

      case 'error':
        setResearchState((prev) => ({
          ...prev,
          status: 'error',
          error: data.error,
        }));
        setIsLoading(false);
        addMessage({
          type: 'error',
          content: data.error,
          timestamp: new Date(),
        });

        // 关闭EventSource连接
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        break;
    }
  };

  // 添加消息
  const addMessage = (message: any) => {
    console.log('%c Line:218 🍰 message', 'color:#4fff4B', message);
    setMessages((prev) => [...prev, message]);
  };

  // 加载历史会话
  const loadHistorySession = async (sessionId: string) => {
    try {
      setIsLoading(true);

      // 关闭当前的EventSource连接
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // 获取历史会话状态
      const response = await fetch(`/api/deepresearch/status/${sessionId}`);

      if (!response.ok) {
        throw new Error('加载历史会话失败');
      }

      const sessionData = await response.json();

      // 重建消息历史
      const historyMessages: any[] = [];

      // 添加用户问题
      historyMessages.push({
        type: 'user',
        content: sessionData.question,
        timestamp: new Date(sessionData.createdAt),
      });

      // 如果有状态数据，重建消息
      if (sessionData.state) {
        const state = sessionData.state;

        if (state.analysis) {
          historyMessages.push({
            type: 'analysis',
            content: state.analysis,
            timestamp: new Date(sessionData.createdAt),
          });
        }

        if (state.plan) {
          historyMessages.push({
            type: 'plan',
            content: state.plan,
            timestamp: new Date(sessionData.createdAt),
          });
        }

        if (state.generatedContent && state.generatedContent.length > 0) {
          state.generatedContent.forEach((content: any) => {
            historyMessages.push({
              type: 'content',
              content,
              timestamp: new Date(sessionData.createdAt),
            });
          });
        }
      }

      // 添加完成消息
      if (sessionData.status === 'completed') {
        historyMessages.push({
          type: 'system',
          content: '研究完成！',
          timestamp: new Date(sessionData.updatedAt),
        });
      } else if (sessionData.status === 'error') {
        historyMessages.push({
          type: 'error',
          content: sessionData.state?.error || '研究过程中出现错误',
          timestamp: new Date(sessionData.updatedAt),
        });
      }

      // 更新状态
      setResearchState({
        sessionId: sessionData.sessionId,
        status: sessionData.status,
        progress: sessionData.progress,
        question: sessionData.question,
        analysis: sessionData.state?.analysis,
        plan: sessionData.state?.plan,
        tasks: sessionData.state?.tasks,
        currentTask: sessionData.state?.currentTask,
        totalTasks: sessionData.state?.totalTasks,
        generatedContent: sessionData.state?.generatedContent,
        finalReport: sessionData.state?.finalReport,
        fileTree: sessionData.fileTree,
        error: sessionData.state?.error,
      });

      setMessages(historyMessages);
      setSelectedFile(null);
      setFileContent('');
    } catch (error: any) {
      console.error('加载历史会话失败:', error);
      addMessage({
        type: 'error',
        content: '加载历史会话失败: ' + error.message,
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 处理历史会话选择
  const handleSelectHistorySession = (sessionId: string) => {
    loadHistorySession(sessionId);
  };

  // 选择文件
  const handleFileSelect = async (filePath: string) => {
    if (!researchState.sessionId) return;

    setSelectedFile(filePath);

    try {
      const response = await fetch(
        `/api/deepresearch/files/${researchState.sessionId}/${filePath}`
      );

      if (response.ok) {
        const content = await response.text();
        setFileContent(content);
      } else {
        setFileContent('文件加载失败');
      }
    } catch (error) {
      console.error('加载文件失败:', error);
      setFileContent('文件加载失败');
    }
  };

  // 清理EventSource连接
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className='h-screen flex flex-col bg-gray-50'>
      {/* 顶部标题栏 */}
      <header className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-gray-900'>DeepResearch</h1>
          <div className='flex items-center space-x-4'>
            {/* 历史按钮 */}
            <button
              onClick={() => setShowHistoryPanel(true)}
              className='flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors'
              title='查看历史记录'
            >
              <Clock className='w-4 h-4' />
              <span>历史</span>
            </button>

            {researchState.sessionId && (
              <span className='text-sm text-gray-500'>
                会话: {researchState.sessionId.slice(0, 8)}...
              </span>
            )}
            <ProgressIndicator
              status={researchState.status}
              progress={researchState.progress}
              currentTask={researchState.currentTask}
              totalTasks={researchState.totalTasks}
            />
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className='flex-1 flex overflow-hidden'>
        {/* 左侧对话面板 */}
        <div className='w-2/5 border-r border-gray-200 flex flex-col'>
          <ChatPanel
            messages={messages}
            researchState={researchState}
            onStartResearch={startResearch}
            isLoading={isLoading}
          />
        </div>

        {/* 右侧预览面板 */}
        <div className='flex-1 flex flex-col'>
          <div className='flex h-full'>
            {/* 文件树 */}
            <div className='w-64 border-r border-gray-200 bg-white'>
              <div className='p-4 border-b border-gray-200'>
                <h3 className='text-sm font-medium text-gray-900'>文件</h3>
              </div>
              <div className='overflow-auto'>
                {researchState.fileTree ? (
                  <FileTree
                    tree={researchState.fileTree}
                    selectedFile={selectedFile}
                    onFileSelect={handleFileSelect}
                  />
                ) : (
                  <div className='p-4 text-sm text-gray-500'>暂无文件</div>
                )}
              </div>
            </div>

            {/* 内容查看器 */}
            <div className='flex-1'>
              <ContentViewer
                selectedFile={selectedFile}
                content={fileContent}
                researchState={researchState}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 历史面板 */}
      <HistoryPanel
        isOpen={showHistoryPanel}
        onClose={() => setShowHistoryPanel(false)}
        onSelectSession={handleSelectHistorySession}
        userId={currentUserId}
      />
    </div>
  );
}
