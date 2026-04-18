import { NextRequest, NextResponse } from 'next/server';
import { requireSeller, getShopForUser, errorJson } from '@/lib/api-auth';
import { getShopPlan } from '@/lib/subscription-server';
import { PLANS } from '@/lib/subscription';

// GET /api/seller/subscription — get current plan info
export async function GET(req: NextRequest) {
  const user = requireSeller(req);
  if (user instanceof NextResponse) return user;

  try {
    const shopId = await getShopForUser(user.id);
    if (!shopId) return errorJson('Дэлгүүр олдсонгүй', 404);

    const shopPlan = await getShopPlan(shopId);

    return NextResponse.json({
      planKey: shopPlan.planKey,
      plan: shopPlan.plan,
      commissionRate: shopPlan.commissionRate,
      expiresAt: shopPlan.expiresAt,
      isActive: shopPlan.isActive,
      billingCycle: shopPlan.billingCycle,
      allPlans: Object.values(PLANS),
    });
  } catch (e: unknown) {
    console.error('[seller/subscription]', e);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
