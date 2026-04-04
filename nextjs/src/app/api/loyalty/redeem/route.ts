import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const POINT_VALUE = 5; // 1 point = 5₮
const MIN_REDEEM = 200;

function generateCouponCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'PTS';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, points, type, orderId } = await req.json();

    if (!userId || !points || !type) {
      return NextResponse.json({ error: 'userId, points, and type required' }, { status: 400 });
    }
    if (points < MIN_REDEEM) {
      return NextResponse.json({ error: `Minimum redemption is ${MIN_REDEEM} points` }, { status: 400 });
    }

    const account = await prisma.loyaltyAccount.findUnique({ where: { userId } });
    if (!account || account.balance < points) {
      return NextResponse.json({ error: 'Insufficient points balance' }, { status: 400 });
    }

    const valueAmount = points * POINT_VALUE;
    const couponCode = generateCouponCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const [redemption] = await Promise.all([
      prisma.loyaltyRedemption.create({
        data: { accountId: account.id, userId, type, pointsUsed: points, valueAmount, couponCode, orderId, expiresAt },
      }),
      prisma.loyaltyTransaction.create({
        data: { accountId: account.id, type: 'REDEEM_DISCOUNT', points: -points, description: `Redeemed ${points} points (${couponCode})`, refType: 'redemption', refId: orderId },
      }),
      prisma.loyaltyAccount.update({
        where: { userId },
        data: { balance: { decrement: points }, lifetimeSpent: { increment: points } },
      }),
    ]);

    return NextResponse.json({ redemption, couponCode, valueAmount });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
