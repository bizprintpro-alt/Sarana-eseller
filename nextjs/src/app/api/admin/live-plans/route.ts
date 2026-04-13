import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, json, errorJson } from '@/lib/api-auth';
import { LIVE_PLANS, LivePlanKey } from '@/lib/live-plans';

// GET /api/admin/live-plans — list all shops with live plans + stats
export async function GET(req: NextRequest) {
  const user = requireAdmin(req);
  if (user instanceof NextResponse) return user;

  try {
    // Count shops per plan
    const planKeys = Object.keys(LIVE_PLANS) as LivePlanKey[];
    const planCounts: Record<string, number> = {};

    for (const key of planKeys) {
      planCounts[key] = await prisma.shop.count({ where: { livePlan: key } });
    }

    // Active live count
    const activeLives = await prisma.liveStream.count({ where: { status: 'LIVE' } });

    // Total viewers from active streams
    const activeStreams = await prisma.liveStream.findMany({
      where: { status: 'LIVE' },
      select: { viewerCount: true },
    });
    const totalViewers = activeStreams.reduce((sum, s) => sum + s.viewerCount, 0);

    // Shops with their plans
    const shops = await prisma.shop.findMany({
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
    });

    return json({ plans: planCounts, activeLives, totalViewers, shops });
  } catch (e: unknown) {
    return errorJson((e as Error).message, 500);
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
    return errorJson((e as Error).message, 500);
  }
}
