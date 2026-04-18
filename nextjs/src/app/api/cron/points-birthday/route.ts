import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loyaltyService } from '@/lib/loyalty/LoyaltyService';

/**
 * GET /api/cron/points-birthday
 * Vercel cron: every day at 09:00
 *
 * Awards birthday bonus points to users whose birthday is today AND who
 * have an active (or trial) Gold membership AND whose tier is GOLD or
 * PLATINUM. Uses LoyaltyService.earn() — the existing API.
 */

const BIRTHDAY_BONUS: Record<string, number> = {
  GOLD: 1000,
  PLATINUM: 2000,
};

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  // 1. Load users with a birthday set.
  //    User has no inverse relation to LoyaltyAccount/GoldMembership,
  //    so we fetch those separately per matched user.
  const candidates = await prisma.user.findMany({
    where: { birthday: { not: null } },
    select: { id: true, birthday: true, name: true },
  });

  const birthdayUsers = candidates.filter((u) => {
    if (!u.birthday) return false;
    const b = new Date(u.birthday);
    return b.getMonth() + 1 === month && b.getDate() === day;
  });

  let processed = 0;
  let skipped = 0;

  // Batch-fetch accounts + memberships for all birthday users → 2 queries instead of 2N
  const userIds = birthdayUsers.map((u) => u.id);
  const [accounts, memberships] = await Promise.all([
    prisma.loyaltyAccount.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, tier: true },
    }),
    prisma.goldMembership.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, status: true, endsAt: true },
    }),
  ]);
  const accountByUser = new Map(accounts.map((a) => [a.userId, a]));
  const membershipByUser = new Map(memberships.map((m) => [m.userId, m]));
  const nowDate = new Date();

  for (const user of birthdayUsers) {
    const gold = membershipByUser.get(user.id);
    const goldActive =
      !!gold &&
      (gold.status === 'ACTIVE' || gold.status === 'TRIAL') &&
      new Date(gold.endsAt) > nowDate;
    if (!goldActive) {
      skipped++;
      continue;
    }

    const tier = accountByUser.get(user.id)?.tier ?? 'BRONZE';
    const bonus = BIRTHDAY_BONUS[tier];
    if (!bonus) {
      skipped++;
      continue;
    }

    try {
      await loyaltyService.earn(
        user.id,
        'EARN_BIRTHDAY',
        bonus,
        `🎂 Төрсөн өдрийн бонус (${tier})`,
      );
      processed++;
    } catch (e) {
      console.error(`Birthday bonus failed for ${user.id}:`, e);
      skipped++;
    }
  }

  return NextResponse.json({
    success: true,
    processed,
    skipped,
    candidatesChecked: birthdayUsers.length,
    date: `${month}/${day}`,
  });
}
