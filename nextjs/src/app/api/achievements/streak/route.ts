// ══════════════════════════════════════════════════════════════
// POST /api/achievements/streak — update daily login streak
// ══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, json } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { grantAchievement } from '@/lib/achievements';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayDiff(a: Date, b: Date): number {
  const msPerDay = 86400000;
  return Math.floor((startOfDay(a).getTime() - startOfDay(b).getTime()) / msPerDay);
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const now = new Date();

  let streak = await prisma.dailyStreak.findUnique({
    where: { userId: auth.id },
  });

  const newAchievements: Array<{ name: string; points: number }> = [];

  if (!streak) {
    // First login ever
    streak = await prisma.dailyStreak.create({
      data: { userId: auth.id, currentStreak: 1, longestStreak: 1, lastLoginAt: now },
    });
  } else {
    const diff = dayDiff(now, streak.lastLoginAt);

    if (diff === 0) {
      // Already logged in today — no change
    } else if (diff === 1) {
      // Consecutive day
      const newCurrent = streak.currentStreak + 1;
      const newLongest = Math.max(streak.longestStreak, newCurrent);
      streak = await prisma.dailyStreak.update({
        where: { userId: auth.id },
        data: { currentStreak: newCurrent, longestStreak: newLongest, lastLoginAt: now },
      });
    } else {
      // Streak broken — reset to 1
      streak = await prisma.dailyStreak.update({
        where: { userId: auth.id },
        data: { currentStreak: 1, longestStreak: Math.max(streak.longestStreak, 1), lastLoginAt: now },
      });
    }
  }

  // Check streak achievements
  if (streak.currentStreak >= 7) {
    const result = await grantAchievement(auth.id, 'streak_7');
    if (result.granted && result.achievement) newAchievements.push(result.achievement);
  }
  if (streak.currentStreak >= 30) {
    const result = await grantAchievement(auth.id, 'streak_30');
    if (result.granted && result.achievement) newAchievements.push(result.achievement);
  }

  return json({
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastLoginAt: streak.lastLoginAt,
    newAchievements,
  });
}
