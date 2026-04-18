import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminDB as requireAdmin } from '@/lib/api-auth';

// GET /api/admin/ai — list all AI insights
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  try {
    const insights = await prisma.aiInsight.findMany({
      where: { status: { not: 'DONE' } },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
      include: { tasks: true },
    });

    const stats = {
      pending: insights.filter(i => i.status === 'PENDING').length,
      critical: insights.filter(i => i.priority === 'CRITICAL').length,
      approved: insights.filter(i => i.status === 'APPROVED').length,
      total: insights.length,
    };

    return NextResponse.json({ insights, stats });
  } catch (e: unknown) {
    console.error('[admin/ai]', e);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
