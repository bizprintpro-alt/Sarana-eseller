import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PLAN_DURATIONS: Record<string, { duration: number; price: number }> = {
  MONTHLY: { duration: 30, price: 19900 },
  QUARTERLY: { duration: 90, price: 49900 },
  ANNUAL: { duration: 365, price: 149900 },
};

export async function GET() {
  try {
    const now = new Date();

    // 1. Expire old points
    const expiredTxns = await prisma.loyaltyTransaction.findMany({
      where: { expiresAt: { lt: now }, points: { gt: 0 } },
    });

    let expiredCount = 0;
    for (const txn of expiredTxns) {
      await prisma.loyaltyAccount.update({
        where: { userId: txn.userId },
        data: { balance: { decrement: txn.points } },
      });
      await prisma.loyaltyTransaction.update({
        where: { id: txn.id },
        data: { points: 0 },
      });
      expiredCount++;
    }

    // 2. Auto-renew gold memberships expiring within next day
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const renewals = await prisma.goldMembership.findMany({
      where: { endsAt: { lte: tomorrow }, autoRenew: true, status: "ACTIVE" },
    });

    let renewedCount = 0;
    for (const m of renewals) {
      const planConfig = PLAN_DURATIONS[m.plan];
      if (!planConfig) continue;

      const newEndsAt = new Date(
        new Date(m.endsAt).getTime() + planConfig.duration * 24 * 60 * 60 * 1000
      );

      await prisma.goldMembership.update({
        where: { id: m.id },
        data: { endsAt: newEndsAt },
      });

      await prisma.membershipPayment.create({
        data: {
          membershipId: m.id,
          userId: m.userId,
          plan: m.plan,
          amount: planConfig.price,
          paymentId: `auto-renew-${m.id}-${Date.now()}`,
          status: "COMPLETED",
        },
      });
      renewedCount++;
    }

    return NextResponse.json({
      expiredPoints: expiredCount,
      renewedMemberships: renewedCount,
      timestamp: now.toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
