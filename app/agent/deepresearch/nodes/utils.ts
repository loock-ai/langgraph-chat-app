import { MessageContent } from '@langchain/core/messages';

// 辅助函数：将 MessageContent 转换为字符串
export function messageContentToString(content: MessageContent): string {
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((item) =>
        typeof item === 'string'
          ? item
          : 'text' in item
          ? item.text
          : JSON.stringify(item)
      )
      .join('');
  }
  return JSON.stringify(content);
}

// 辅助函数：提取关键点
export function extractKeyPoints(content: string): string[] {
  const lines = content.split('\n');
  return lines
    .filter(
      (line) => line.includes('•') || line.includes('-') || line.includes('*')
    )
    .map((line) => line.replace(/[•\-*]\s*/, '').trim())
    .filter((line) => line.length > 10)
    .slice(0, 10);
}

// 辅助函数：提取洞察
export function extractInsights(content: string): string[] {
  const insightKeywords = ['洞察', '发现', '趋势', '模式', '关键', '重要'];
  const lines = content.split('\n');
  return lines
    .filter((line) => insightKeywords.some((keyword) => line.includes(keyword)))
    .map((line) => line.trim())
    .filter((line) => line.length > 20)
    .slice(0, 5);
}

// 辅助函数：提取来源
export function extractSources(content: string): string[] {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = content.match(urlRegex) || [];
  return [...new Set(urls)].slice(0, 10);
}
