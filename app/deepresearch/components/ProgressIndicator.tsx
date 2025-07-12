interface ProgressIndicatorProps {
  status: string;
  progress: number;
  currentTask?: number;
  totalTasks?: number;
}

export function ProgressIndicator({
  status,
  progress,
  currentTask,
  totalTasks,
}: ProgressIndicatorProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzing':
        return 'bg-blue-500';
      case 'planning':
        return 'bg-purple-500';
      case 'executing':
        return 'bg-orange-500';
      case 'generating':
        return 'bg-green-500';
      case 'completed':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'idle':
        return '等待开始';
      case 'starting':
        return '正在启动';
      case 'analyzing':
        return '分析问题';
      case 'planning':
        return '制定计划';
      case 'executing':
        return '执行研究';
      case 'generating':
        return '生成报告';
      case 'completed':
        return '研究完成';
      case 'error':
        return '发生错误';
      default:
        return status;
    }
  };

  return (
    <div className='flex items-center space-x-3'>
      {/* 状态指示器 */}
      <div className='flex items-center space-x-2'>
        <div
          className={`w-3 h-3 rounded-full ${getStatusColor(status)} ${
            status === 'executing' ? 'animate-pulse' : ''
          }`}
        />
        <span className='text-sm font-medium text-gray-700'>
          {getStatusText(status)}
        </span>
      </div>

      {/* 进度条 */}
      {progress > 0 && (
        <div className='flex items-center space-x-2'>
          <div className='w-32 bg-gray-200 rounded-full h-2'>
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(
                status
              )}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <span className='text-xs text-gray-500'>{progress.toFixed(1)}%</span>
        </div>
      )}

      {/* 任务进度 */}
      {currentTask !== undefined &&
        totalTasks !== undefined &&
        totalTasks > 0 && (
          <span className='text-xs text-gray-500'>
            {currentTask + 1}/{totalTasks}
          </span>
        )}
    </div>
  );
}
