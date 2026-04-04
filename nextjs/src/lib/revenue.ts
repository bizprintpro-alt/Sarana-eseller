import { prisma } from './prisma';

export type RevenueSource =
  | 'commission' | 'subscription' | 'banner' | 'sms' | 'email'
  | 'push' | 'affiliate' | 'ai_credit' | 'featured' | 'delivery';

export async function recordRevenue(
  source: RevenueSource,
  amount: number,
  meta?: Record<string, string | number>
) {
  await prisma.platformRevenue.create({
    data: {
      date: new Date(),
      source,
      amount,
      meta: meta ?? {},
    },
  });
}

export async function getRevenueByPeriod(days: number = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const revenues = await prisma.platformRevenue.findMany({
    where: { date: { gte: since } },
  });

  // Group by source
  const bySource: Record<string, { amount: number; count: number }> = {};
  let total = 0;

  for (const r of revenues) {
    if (!bySource[r.source]) bySource[r.source] = { amount: 0, count: 0 };
    bySource[r.source].amount += r.amount;
    bySource[r.source].count += r.count;
    total += r.amount;
  }

  // Today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayRevenue = revenues
    .filter(r => new Date(r.date) >= today)
    .reduce((s, r) => s + r.amount, 0);

  return { bySource, total, todayRevenue, count: revenues.length };
}
