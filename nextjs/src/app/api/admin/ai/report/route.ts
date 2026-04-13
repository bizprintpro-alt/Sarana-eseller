import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminDB as requireAdmin } from '@/lib/api-auth';
import { generateWorkReport } from '@/lib/ai/analyzeSystem';

// GET /api/admin/ai/report — хийгдсэн ажлын тайлан + AI дүгнэлт
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  try {
    const days = Number(req.nextUrl.searchParams.get('days') || '7');
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get insights summary
    const [total, pending, approved, done, critical, recent, logs] = await Promise.all([
      prisma.aiInsight.count(),
      prisma.aiInsight.count({ where: { status: 'PENDING' } }),
      prisma.aiInsight.count({ where: { status: 'APPROVED' } }),
      prisma.aiInsight.count({ where: { status: 'DONE' } }),
      prisma.aiInsight.count({ where: { priority: 'CRITICAL', status: { not: 'DONE' } } }),
      prisma.aiInsight.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { tasks: true },
      }),
      prisma.aiActivityLog.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Group by type
    const byType: Record<string, number> = {};
    for (const i of recent) {
      byType[i.type] = (byType[i.type] || 0) + 1;
    }

    return NextResponse.json({
      period: `${days} хоног`,
      summary: { total, pending, approved, done, critical },
      byType,
      recentInsights: recent,
      activityLogs: logs,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// POST /api/admin/ai/report — git commit тайлан үүсгэх
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  try {
    const { commits } = await req.json();
    if (!commits || !Array.isArray(commits)) {
      return NextResponse.json({ error: 'commits array шаардлагатай' }, { status: 400 });
    }

    const report = await generateWorkReport(commits);
    return NextResponse.json({ report });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
