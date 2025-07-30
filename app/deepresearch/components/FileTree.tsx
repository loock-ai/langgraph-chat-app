import { useState } from 'react';

interface FileTreeNode {
  name: string;
  type: 'file' | 'directory';
  path?: string;
  size?: number;
  fileType?: string;
  children?: FileTreeNode[];
}

interface FileTreeProps {
  tree: FileTreeNode;
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
}

export function FileTree({ tree, selectedFile, onFileSelect }: FileTreeProps) {
  return (
    <div className='p-2'>
      <FileTreeNode
        node={tree}
        level={0}
        selectedFile={selectedFile}
        onFileSelect={onFileSelect}
      />
    </div>
  );
}

interface FileTreeNodeProps {
  node: FileTreeNode;
  level: number;
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
}

function FileTreeNode({
  node,
  level,
  selectedFile,
  onFileSelect,
}: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getFileIcon = (fileType?: string) => {
    switch (fileType) {
      case 'html':
        return '🌐';
      case 'markdown':
        return '📝';
      case 'json':
        return '📋';
      default:
        return '📄';
    }
  };

  const handleClick = () => {
    if (node.type === 'directory') {
      setIsExpanded(!isExpanded);
    } else if (node.path) {
      onFileSelect(node.path);
    }
  };

  const formatFileSize = (size?: number) => {
    if (!size) return '';
    if (size < 1024) return `${size}B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
    return `${(size / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 rounded cursor-pointer hover:bg-gray-100 ${
          node.path === selectedFile ? 'bg-blue-100 text-blue-800' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === 'directory' ? (
          <span className='mr-2 text-sm'>{isExpanded ? '📂' : '📁'}</span>
        ) : (
          <span className='mr-2 text-sm'>{getFileIcon(node.fileType)}</span>
        )}

        <span className='flex-1 text-sm truncate'>{node.name}</span>

        {node.type === 'file' && node.size && (
          <span className='text-xs text-gray-500 ml-2'>
            {formatFileSize(node.size)}
          </span>
        )}
      </div>

      {node.type === 'directory' && isExpanded && node.children && (
        <div>
          {node.children.map((child, index) => (
            <FileTreeNode
              key={`${child.name}-${index}`}
              node={child}
              level={level + 1}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
