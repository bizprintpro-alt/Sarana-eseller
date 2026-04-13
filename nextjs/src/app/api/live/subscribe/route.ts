import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, getShopForUser, json, errorJson } from '@/lib/api-auth';
import { LIVE_PLANS, LivePlanKey } from '@/lib/live-plans';

// POST /api/live/subscribe — subscribe to a live plan
export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const shopId = await getShopForUser(user.id);
    if (!shopId) return errorJson('Дэлгүүр олдсонгүй', 404);

    const body = await req.json();
    const { plan } = body as { plan: string };

    if (!plan || !LIVE_PLANS[plan as LivePlanKey]) {
      return errorJson('Буруу багц сонгосон', 400);
    }

    // QPay integration placeholder — just update the plan directly for now
    const updated = await prisma.shop.update({
      where: { id: shopId },
      data: {
        livePlan: plan,
        liveCount: 0,
        liveResetAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        livePlan: true,
        liveCount: true,
        liveResetAt: true,
      },
    });

    return json({ success: true, plan, shop: updated });
  } catch (e: unknown) {
    return errorJson((e as Error).message, 500);
  }
}
