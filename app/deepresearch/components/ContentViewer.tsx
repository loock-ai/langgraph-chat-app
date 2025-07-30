import { useState } from 'react';

interface ContentViewerProps {
  selectedFile: string | null;
  content: string;
  researchState: any;
}

export function ContentViewer({
  selectedFile,
  content,
  researchState,
}: ContentViewerProps) {
  const [viewMode, setViewMode] = useState<'source' | 'preview'>('preview');

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const renderContent = () => {
    if (!selectedFile || !content) {
      return (
        <div className='flex items-center justify-center h-full text-gray-500'>
          <div className='text-center'>
            <div className='text-4xl mb-4'>📄</div>
            <p>选择文件查看内容</p>
          </div>
        </div>
      );
    }

    const extension = getFileExtension(selectedFile);

    if (viewMode === 'source') {
      return (
        <pre className='p-4 text-sm font-mono whitespace-pre-wrap overflow-auto h-full bg-gray-50'>
          {content}
        </pre>
      );
    }

    // 预览模式
    switch (extension) {
      case 'html':
        return (
          <iframe
            srcDoc={content}
            className='w-full h-full border-0'
            title='HTML Preview'
          />
        );

      case 'md':
        return (
          <div className='p-4 prose prose-sm max-w-none overflow-auto h-full'>
            <div
              dangerouslySetInnerHTML={{
                __html: content.replace(/\n/g, '<br>'),
              }}
            />
          </div>
        );

      case 'json':
        try {
          const jsonData = JSON.parse(content);
          return (
            <div className='p-4 overflow-auto h-full'>
              <pre className='text-sm bg-gray-50 p-4 rounded'>
                {JSON.stringify(jsonData, null, 2)}
              </pre>
            </div>
          );
        } catch {
          return (
            <pre className='p-4 text-sm font-mono whitespace-pre-wrap overflow-auto h-full bg-gray-50'>
              {content}
            </pre>
          );
        }

      default:
        return (
          <pre className='p-4 text-sm font-mono whitespace-pre-wrap overflow-auto h-full bg-gray-50'>
            {content}
          </pre>
        );
    }
  };

  const canToggleView =
    selectedFile &&
    ['html', 'md', 'json'].includes(getFileExtension(selectedFile));

  return (
    <div className='flex flex-col h-full bg-white'>
      {/* 工具栏 */}
      <div className='flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50'>
        <div className='flex items-center space-x-2'>
          {selectedFile ? (
            <>
              <span className='text-sm font-medium text-gray-900'>
                {selectedFile}
              </span>
              <span className='text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded'>
                {getFileExtension(selectedFile).toUpperCase()}
              </span>
            </>
          ) : (
            <span className='text-sm text-gray-500'>未选择文件</span>
          )}
        </div>

        <div className='flex items-center space-x-2'>
          {canToggleView && (
            <div className='flex bg-white border border-gray-300 rounded-md'>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 text-sm rounded-l-md ${
                  viewMode === 'preview'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                预览
              </button>
              <button
                onClick={() => setViewMode('source')}
                className={`px-3 py-1 text-sm rounded-r-md ${
                  viewMode === 'source'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                源码
              </button>
            </div>
          )}

          {selectedFile === 'index.html' && researchState.sessionId && (
            <a
              href={`/${researchState.sessionId}/index.html`}
              target='_blank'
              rel='noopener noreferrer'
              className='px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600'
            >
              在新窗口打开
            </a>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div className='flex-1 overflow-hidden'>{renderContent()}</div>

      {/* 状态栏 */}
      {selectedFile && content && (
        <div className='px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500'>
          <div className='flex justify-between'>
            <span>
              {content.split('\n').length} 行, {content.length} 字符
            </span>
            <span>{viewMode === 'preview' ? '预览模式' : '源码模式'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
