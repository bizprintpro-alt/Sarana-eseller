import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const POINT_VALUE = 5; // 1 point = 5₮
const MIN_REDEEM = 200;

function generateCouponCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "PTS";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, points, type, orderId } = await req.json();

    if (!userId || !points || !type) {
      return NextResponse.json({ error: "userId, points, and type required" }, { status: 400 });
    }
    if (points < MIN_REDEEM) {
      return NextResponse.json({ error: `Minimum redemption is ${MIN_REDEEM} points` }, { status: 400 });
    }

    const account = await prisma.loyaltyAccount.findUnique({ where: { userId } });
    if (!account || account.balance < points) {
      return NextResponse.json({ error: "Insufficient points balance" }, { status: 400 });
    }

    const valueAmount = points * POINT_VALUE;
    const couponCode = generateCouponCode();

    const [redemption] = await Promise.all([
      prisma.loyaltyRedemption.create({
        data: { userId, points, type, valueAmount, couponCode, orderId, status: "ACTIVE" },
      }),
      prisma.loyaltyTransaction.create({
        data: { userId, type: "REDEEM", points: -points, description: `Redeemed ${points} points (${couponCode})`, refType: "redemption", refId: orderId },
      }),
      prisma.loyaltyAccount.update({
        where: { userId },
        data: { balance: { decrement: points } },
      }),
    ]);

    return NextResponse.json({ redemption, couponCode, valueAmount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
