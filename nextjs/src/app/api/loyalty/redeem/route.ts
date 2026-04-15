import { NextRequest, NextResponse } from 'next/server';
import { loyaltyService } from '@/lib/loyalty/LoyaltyService';
import { requireAuth } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    // userId in body is ignored — trust the JWT only
    const { points, type, orderId } = await req.json();
    if (!points) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const redemption = await loyaltyService.redeem(user.id, points, type || 'discount', orderId);

    return NextResponse.json({
      couponCode: redemption.couponCode,
      valueAmount: redemption.valueAmount,
      pointsUsed: redemption.pointsUsed,
      expiresAt: redemption.expiresAt,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
