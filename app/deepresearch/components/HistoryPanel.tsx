'use client';

import { useState, useEffect } from 'react';
import { Clock, FileText, CheckCircle, X, Play } from 'lucide-react';

interface HistorySession {
  id: string;
  question: string;
  status: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
  userId: string;
}

export default function HistoryPanel({
  isOpen,
  onClose,
  onSelectSession,
  userId,
}: HistoryPanelProps) {
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchHistory();
    }
  }, [isOpen, userId]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/deepresearch/history?userId=${userId}`
      );
      if (!response.ok) {
        throw new Error('获取历史记录失败');
      }
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='w-5 h-5 text-green-500' />;
      case 'cancelled':
        return <X className='w-5 h-5 text-red-500' />;
      case 'analyzing':
      case 'planning':
      case 'executing':
        return <Play className='w-5 h-5 text-blue-500' />;
      default:
        return <Clock className='w-5 h-5 text-gray-500' />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
      case 'analyzing':
        return '分析中';
      case 'planning':
        return '规划中';
      case 'executing':
        return '执行中';
      default:
        return '未知状态';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSessionClick = (sessionId: string) => {
    onSelectSession(sessionId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-4xl h-3/4 flex flex-col'>
        {/* 头部 */}
        <div className='flex items-center justify-between p-6 border-b'>
          <h2 className='text-xl font-semibold text-gray-900 flex items-center'>
            <Clock className='w-6 h-6 mr-2' />
            研究历史记录
          </h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* 内容区域 */}
        <div className='flex-1 overflow-hidden'>
          {loading ? (
            <div className='flex items-center justify-center h-full'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
              <span className='ml-2 text-gray-600'>加载中...</span>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center h-full'>
              <div className='text-center'>
                <X className='w-12 h-12 text-red-500 mx-auto mb-2' />
                <p className='text-red-600'>{error}</p>
                <button
                  onClick={fetchHistory}
                  className='mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
                >
                  重试
                </button>
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className='flex items-center justify-center h-full'>
              <div className='text-center text-gray-500'>
                <FileText className='w-12 h-12 mx-auto mb-2' />
                <p>暂无研究记录</p>
              </div>
            </div>
          ) : (
            <div className='h-full overflow-y-auto p-6'>
              <div className='space-y-4'>
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleSessionClick(session.id)}
                    className='border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors'
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center mb-2'>
                          {getStatusIcon(session.status)}
                          <span className='ml-2 text-sm font-medium text-gray-600'>
                            {getStatusText(session.status)}
                          </span>
                          {session.status !== 'completed' &&
                            session.status !== 'cancelled' && (
                              <span className='ml-2 text-sm text-blue-600'>
                                {session.progress}%
                              </span>
                            )}
                        </div>
                        <h3 className='text-lg font-medium text-gray-900 mb-2 line-clamp-2'>
                          {session.question}
                        </h3>
                        <div className='text-sm text-gray-500'>
                          <p>创建时间: {formatDate(session.createdAt)}</p>
                          <p>更新时间: {formatDate(session.updatedAt)}</p>
                        </div>
                      </div>
                      <div className='ml-4 flex-shrink-0'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSessionClick(session.id);
                          }}
                          className='px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
                        >
                          查看
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
