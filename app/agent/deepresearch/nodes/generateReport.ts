import { HumanMessage } from '@langchain/core/messages';
import { ResearchState } from '../state';
import { createLLM } from './llm';
import { RunnableConfig } from '@langchain/core/runnables';

// 最终报告生成节点
export async function generateReportNode(
  state: ResearchState,
  config?: RunnableConfig
): Promise<Partial<ResearchState>> {
  const { generatedContent, question, messages } = state;

  // 按章节顺序排序内容
  const sortedContent = generatedContent.sort(
    (a, b) => a.sectionIndex - b.sectionIndex
  );

  const reportPrompt = `你是一个专业的HTML文档生成器。请严格按照以下要求生成HTML文档：

🚨 **输出格式要求（必须严格遵守）：**
- 直接输出完整的HTML代码
- 不要使用 \`\`\`html 或 \`\`\` 包装代码
- 不要添加任何解释、说明或其他文字
- 第一行必须是 <!DOCTYPE html>
- 最后一行必须是 </html>

📋 **研究内容：**
研究问题：${question}

章节内容：
${sortedContent
  .map(
    (section) => `
## ${section.title}
${section.content}
`
  )
  .join('\n\n')}

📄 **HTML文档结构要求：**
1. 完整的HTML5文档结构（<!DOCTYPE html>、<html>、<head>、<body>）
2. 内嵌CSS样式（<style>标签内，不使用外部文件）
3. 内嵌JavaScript功能（<script>标签内，如需要）

📝 **内容组织结构：**
根据研究问题，和研究内容生成，生成最适合当前主题的内容

🎨 **设计规范：**
- **字体系统**：Inter, "SF Pro Display", Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- **配色方案**：
  - 主色：深蓝渐变 (#1e3a8a → #3b82f6)
  - 辅助色：优雅灰色调 (#f8fafc, #e2e8f0, #64748b)
  - 强调色：琥珀色 (#f59e0b, #fbbf24)
- **布局设计**：
  - 卡片式布局，精致阴影和圆角
  - 黄金比例间距，完美视觉层次
  - 渐变背景，悬停动画效果
- **响应式设计**：桌面和移动设备完美适配
- **交互功能**：
  - 侧边栏导航
  - 滚动高亮当前章节
  - 返回顶部按钮
  - 主题切换（明暗模式）
  - 全屏阅读模式

⚡ **技术实现要求：**
- CSS Grid 和 Flexbox 布局
- CSS 自定义属性（CSS Variables）管理主题
- 移动优先响应式设计
- 现代浏览器兼容性
- 语义化HTML5标签
- ARIA无障碍标签
- SEO优化meta标签
- 打印样式优化
- 流畅的CSS动画和过渡效果

⚠️ **重要提醒：直接输出HTML代码，从<!DOCTYPE html>开始，到</html>结束，不要任何其他内容！**`;

  const llm = createLLM(config?.configurable?.tools);

  const response = await llm.invoke([
    ...messages,
    new HumanMessage(reportPrompt),
  ]);

  return {
    finalReport: response.content as string,
    status: 'completed',
    progress: 100,
    messages: [...messages, new HumanMessage(reportPrompt), response],
  };
}
