import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const PLAN_DURATIONS: Record<string, { duration: number; price: number }> = {
  MONTHLY: { duration: 30, price: 19900 },
  QUARTERLY: { duration: 90, price: 49900 },
  ANNUAL: { duration: 365, price: 149900 },
};

export async function GET() {
  try {
    const now = new Date();

    // 1. Expire old points — group by accountId so each account gets ONE decrement
    //    instead of one per transaction (was O(2N); now O(accounts) reads/writes).
    const expiredTxns = await prisma.loyaltyTransaction.findMany({
      where: { expiresAt: { lt: now }, points: { gt: 0 } },
      include: { account: true },
    });

    const byAccount = new Map<string, { balance: number; totalExpire: number; txnIds: string[] }>();
    for (const txn of expiredTxns) {
      if (!txn.account || txn.account.balance <= 0) continue;
      const entry = byAccount.get(txn.accountId) ?? {
        balance: txn.account.balance,
        totalExpire: 0,
        txnIds: [],
      };
      const remaining = entry.balance - entry.totalExpire;
      const amt = Math.min(txn.points, Math.max(0, remaining));
      if (amt <= 0) continue;
      entry.totalExpire += amt;
      entry.txnIds.push(txn.id);
      byAccount.set(txn.accountId, entry);
    }

    let expiredCount = 0;
    await Promise.all(
      Array.from(byAccount.entries()).map(async ([accountId, e]) => {
        if (e.totalExpire <= 0) return;
        expiredCount += e.txnIds.length;
        await Promise.all([
          prisma.loyaltyAccount.update({
            where: { id: accountId },
            data: { balance: { decrement: e.totalExpire } },
          }),
          prisma.loyaltyTransaction.updateMany({
            where: { id: { in: e.txnIds } },
            data: { points: 0 },
          }),
        ]);
      }),
    );

    // 2. Auto-renew gold memberships — run in parallel
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const renewals = await prisma.goldMembership.findMany({
      where: { endsAt: { lte: tomorrow }, autoRenew: true, status: 'ACTIVE' },
    });

    const renewalResults: number[] = await Promise.all(
      renewals.map(async (m): Promise<number> => {
        const planConfig = PLAN_DURATIONS[m.plan];
        if (!planConfig) return 0;
        const newEndsAt = new Date(m.endsAt.getTime() + planConfig.duration * 24 * 60 * 60 * 1000);
        await prisma.$transaction([
          prisma.goldMembership.update({ where: { id: m.id }, data: { endsAt: newEndsAt } }),
          prisma.membershipPayment.create({
            data: {
              membershipId: m.id,
              plan: m.plan,
              amount: planConfig.price,
              method: 'auto-renew',
              refId: `auto-${m.id}-${Date.now()}`,
            },
          }),
        ]);
        return 1;
      }),
    );
    const renewedCount = renewalResults.reduce((a, b) => a + b, 0);

    return NextResponse.json({
      expiredPoints: expiredCount,
      renewedMemberships: renewedCount,
      timestamp: now.toISOString(),
    });
  } catch (error: unknown) {
    console.error('[cron/loyalty]', error);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
