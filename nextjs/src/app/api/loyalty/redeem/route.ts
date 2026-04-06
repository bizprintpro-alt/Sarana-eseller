import { NextRequest, NextResponse } from 'next/server';
import { loyaltyService } from '@/lib/loyalty/LoyaltyService';

export async function POST(req: NextRequest) {
  try {
    const { userId, points, type, orderId } = await req.json();
    if (!userId || !points) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const redemption = await loyaltyService.redeem(userId, points, type || 'discount', orderId);

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
