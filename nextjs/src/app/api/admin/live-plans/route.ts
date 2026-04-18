import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, json, errorJson } from '@/lib/api-auth';
import { LIVE_PLANS, LivePlanKey } from '@/lib/live-plans';

// GET /api/admin/live-plans — list all shops with live plans + stats
export async function GET(req: NextRequest) {
  const user = requireAdmin(req);
  if (user instanceof NextResponse) return user;

  try {
    const planKeys = Object.keys(LIVE_PLANS) as LivePlanKey[];

    // Parallel: groupBy replaces loop of count(). Sum viewers via aggregate.
    const [planGroups, activeLives, viewersAgg, shops] = await Promise.all([
      prisma.shop.groupBy({ by: ['livePlan'], _count: { _all: true } }),
      prisma.liveStream.count({ where: { status: 'LIVE' } }),
      prisma.liveStream.aggregate({ where: { status: 'LIVE' }, _sum: { viewerCount: true } }),
      prisma.shop.findMany({
        select: {
          id: true,
          name: true,
          logo: true,
          livePlan: true,
          liveCount: true,
          liveResetAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ]);

    const planCounts: Record<string, number> = {};
    for (const key of planKeys) {
      planCounts[key] = planGroups.find((g) => g.livePlan === key)?._count._all ?? 0;
    }

    return json({ plans: planCounts, activeLives, totalViewers: viewersAgg._sum.viewerCount ?? 0, shops });
  } catch (e: unknown) {
    console.error('[admin/live-plans GET]', e);
    return errorJson('Серверийн алдаа', 500);
  }
}

// PUT /api/admin/live-plans — update a shop's plan
export async function PUT(req: NextRequest) {
  const user = requireAdmin(req);
  if (user instanceof NextResponse) return user;

  try {
    const body = await req.json();
    const { shopId, plan } = body as { shopId: string; plan: string };

    if (!shopId || !plan) return errorJson('shopId болон plan шаардлагатай', 400);
    if (!LIVE_PLANS[plan as LivePlanKey]) return errorJson('Буруу багц', 400);

    const updated = await prisma.shop.update({
      where: { id: shopId },
      data: { livePlan: plan },
      select: {
        id: true,
        name: true,
        livePlan: true,
        liveCount: true,
      },
    });

    return json(updated);
  } catch (e: unknown) {
    console.error('[admin/live-plans PUT]', e);
    return errorJson('Серверийн алдаа', 500);
  }
}
