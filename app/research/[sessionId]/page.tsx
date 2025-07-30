import { notFound } from 'next/navigation';
import { sessionDb } from '../../api/deepresearch/db';
import { FileManager } from '../../api/deepresearch/fileManager';

interface ResearchReportPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function ResearchReportPage({
  params,
}: ResearchReportPageProps) {
  const { sessionId } = await params;

  // 验证会话存在
  const session = sessionDb.get(sessionId);
  if (!session) {
    notFound();
  }

  // 获取文件管理器
  const fileManager = new FileManager(sessionId);

  // 读取HTML文件内容
  const htmlContent = await fileManager.readFile('index.html');
  if (!htmlContent) {
    notFound();
  }

  // 直接返回HTML内容
  return (
    <div
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{ height: '100vh', width: '100vw' }}
    />
  );
}

// 生成静态参数（可选，用于静态生成）
export async function generateStaticParams() {
  // 这里可以返回一些预定义的sessionId
  // 实际应用中可能不需要静态生成
  return [];
}

// 页面元数据
export async function generateMetadata({ params }: ResearchReportPageProps) {
  const { sessionId } = await params;

  try {
    const session = sessionDb.get(sessionId);
    if (!session) {
      return {
        title: '研究报告不存在',
      };
    }

    return {
      title: `${session.question} - 深度研究报告`,
      description: '由 DeepResearch AI 助手生成的研究报告',
    };
  } catch {
    return {
      title: '研究报告',
    };
  }
}
