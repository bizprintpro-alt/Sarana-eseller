// ══════════════════════════════════════════════════════════════
// eseller.mn — Achievement helper functions
// ══════════════════════════════════════════════════════════════

import { prisma } from './prisma';

export const ACHIEVEMENTS = [
  { key: 'first_purchase', name: 'Анхны худалдан авалт', description: 'Анхны бараагаа авлаа', icon: 'ShoppingBag', points: 500 },
  { key: 'streak_7', name: '7 өдрийн дараалал', description: '7 хоног дараалан нэвтэрсэн', icon: 'Flame', points: 700 },
  { key: 'streak_30', name: '30 өдрийн дараалал', description: '30 хоног дараалан нэвтэрсэн', icon: 'Trophy', points: 3000 },
  { key: 'reviewer', name: '10 үнэлгээ өгсөн', description: '10 бараанд үнэлгээ өгсөн', icon: 'Star', points: 1000 },
  { key: 'big_spender', name: '1M₮ зарцуулсан', description: 'Нийт 1,000,000₮ зарцуулсан', icon: 'Wallet', points: 5000 },
  { key: 'referral_master', name: '10 найз урьсан', description: '10 найзаа урьж бүртгүүлсэн', icon: 'Users', points: 5000 },
  { key: 'live_buyer', name: 'Live-ээс авсан', description: 'Live дамжуулалтаас бараа авсан', icon: 'Radio', points: 300 },
  { key: 'herder_supporter', name: 'Малчнаас авсан', description: 'Малчны дэлгүүрээс бараа авсан', icon: 'Mountain', points: 500 },
] as const;

export async function grantAchievement(
  userId: string,
  achievementKey: string
): Promise<{ granted: boolean; achievement?: { name: string; points: number } }> {
  const achievement = await prisma.achievement.findUnique({
    where: { key: achievementKey },
  });
  if (!achievement) return { granted: false };

  // Check if user already has this achievement
  const existing = await prisma.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId: achievement.id } },
  });
  if (existing) return { granted: false };

  // Grant it
  await prisma.userAchievement.create({
    data: { userId, achievementId: achievement.id },
  });

  return {
    granted: true,
    achievement: { name: achievement.name, points: achievement.points },
  };
}
