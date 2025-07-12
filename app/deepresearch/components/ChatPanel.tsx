import { useState, useRef, useEffect } from 'react';

interface Message {
  type: 'user' | 'system' | 'analysis' | 'plan' | 'content' | 'error';
  content: any;
  timestamp: Date;
}

interface ChatPanelProps {
  messages: Message[];
  researchState: any;
  onStartResearch: (question: string) => void;
  isLoading: boolean;
}

export function ChatPanel({
  messages,
  researchState,
  onStartResearch,
  isLoading,
}: ChatPanelProps) {
  const [question, setQuestion] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  console.log('%c Line:18 🥑 messages', 'color:#e41a6a', messages);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    onStartResearch(question.trim());
    setQuestion('');
  };

  const renderMessage = (message: Message, index: number) => {
    console.log('%c Line:39 🥒 message', 'color:#33a5ff', message);
    const { type, content, timestamp } = message;

    switch (type) {
      case 'user':
        return (
          <div key={index} className='flex justify-end mb-4'>
            <div className='bg-blue-500 text-white rounded-lg px-4 py-2 max-w-xs'>
              <p className='text-sm'>{content}</p>
              <span className='text-xs opacity-75'>
                {timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        );

      case 'system':
        return (
          <div key={index} className='flex justify-center mb-4'>
            <div className='bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm'>
              {content}
            </div>
          </div>
        );

      case 'analysis':
        return (
          <div key={index} className='mb-4'>
            <div className='bg-blue-50 border-l-4 border-blue-400 p-4 rounded'>
              <h4 className='font-semibold text-blue-800 mb-2'>问题分析</h4>
              <div className='text-sm text-blue-700'>
                <p>
                  <strong>核心主题:</strong> {content.coreTheme}
                </p>
                <p>
                  <strong>关键词:</strong> {content.keywords?.join(', ')}
                </p>
                <p>
                  <strong>复杂度:</strong> {content.complexity}
                </p>
                <p>
                  <strong>预计时间:</strong> {content.estimatedTime}分钟
                </p>
              </div>
            </div>
          </div>
        );

      case 'plan':
        return (
          <div key={content.taskId} className='mb-4'>
            <div className='bg-purple-50 border-l-4 border-purple-400 p-4 rounded'>
              <h4 className='font-semibold text-purple-800 mb-2'>研究计划</h4>
              <div className='text-sm text-purple-700'>
                <p>
                  <strong>标题:</strong> {content.title}
                </p>
                <p>
                  <strong>描述:</strong> {content.description}
                </p>
                {content.sections && (
                  <div className='mt-2'>
                    <strong>章节:</strong>
                    <ul className='list-disc list-inside ml-2'>
                      {content.sections.map((section: any, idx: number) => (
                        <li key={idx}>{section.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'content':
        return (
          <div key={index} className='mb-4'>
            <div className='bg-green-50 border-l-4 border-green-400 p-4 rounded'>
              <h4 className='font-semibold text-green-800 mb-2'>
                生成内容: {content.title}
              </h4>
              <div className='text-sm text-green-700'>
                <div className='max-h-32 overflow-y-auto'>
                  <pre className='whitespace-pre-wrap'>{content.content}</pre>
                </div>
              </div>
            </div>
          </div>
        );

      case 'error':
        return (
          <div key={index} className='mb-4'>
            <div className='bg-red-50 border-l-4 border-red-400 p-4 rounded'>
              <h4 className='font-semibold text-red-800 mb-2'>错误</h4>
              <p className='text-sm text-red-700'>{content}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='flex flex-col h-full'>
      {/* 问题输入区 */}
      <div className='p-4 border-b border-gray-200 bg-white'>
        <form onSubmit={handleSubmit} className='space-y-3'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              研究问题
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder='请输入您想要研究的问题或主题...'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
              rows={3}
              disabled={isLoading}
            />
          </div>
          <button
            type='submit'
            disabled={!question.trim() || isLoading}
            className='w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isLoading ? '研究中...' : '开始研究'}
          </button>
        </form>
      </div>

      {/* 消息列表 */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.length === 0 ? (
          <div className='text-center text-gray-500 mt-8'>
            <p>输入研究问题开始您的深度研究之旅</p>
          </div>
        ) : (
          messages.map((message, index) => renderMessage(message, index))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 任务列表 */}
      {researchState.tasks && researchState.tasks.length > 0 && (
        <div className='border-t border-gray-200 bg-gray-50 p-4'>
          <h3 className='text-sm font-medium text-gray-900 mb-3'>任务进度</h3>
          <div className='space-y-2 max-h-48 overflow-y-auto'>
            {researchState.tasks.map((task: any, index: number) => (
              <div
                key={task.id || index}
                className={`flex items-center space-x-2 p-2 rounded text-sm ${
                  task.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : task.status === 'running'
                    ? 'bg-blue-100 text-blue-800'
                    : task.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    task.status === 'completed'
                      ? 'bg-green-500'
                      : task.status === 'running'
                      ? 'bg-blue-500 animate-pulse'
                      : task.status === 'failed'
                      ? 'bg-red-500'
                      : 'bg-gray-400'
                  }`}
                />
                <span className='flex-1'>{task.title}</span>
                <span className='text-xs opacity-75'>
                  {task.status === 'completed'
                    ? '✓'
                    : task.status === 'running'
                    ? '...'
                    : task.status === 'failed'
                    ? '✗'
                    : '○'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
