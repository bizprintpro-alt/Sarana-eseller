import { NextRequest } from 'next/server';
import { requireAdminDB, json, errorJson } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { loyaltyService } from '@/lib/loyalty/LoyaltyService';

/**
 * POST /api/admin/loyalty/adjust
 * Admin-only manual loyalty balance adjustment.
 *
 * Body: { userId: string, points: number, reason: string }
 *   points > 0 → credit  (type: EARN_BONUS)
 *   points < 0 → deduct  (type: ADJUST, cannot go below zero)
 *
 * Writes an AdminLog audit entry.
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdminDB(req);
  if (admin instanceof Response) return admin;

  try {
    const body = await req.json();
    const { userId, points, reason } = body as {
      userId?: string;
      points?: number;
      reason?: string;
    };

    if (!userId || typeof userId !== 'string') {
      return errorJson('userId шаардлагатай', 400);
    }
    if (typeof points !== 'number' || !Number.isFinite(points) || points === 0) {
      return errorJson('points 0-с ялгаатай тоо байх ёстой', 400);
    }
    if (!reason?.trim()) {
      return errorJson('Шалтгаан (reason) шаардлагатай', 400);
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });
    if (!targetUser) return errorJson('Хэрэглэгч олдсонгүй', 404);

    let newBalance: number;

    if (points > 0) {
      // Credit — reuse LoyaltyService.earn so tier + multipliers behave consistently
      await loyaltyService.earn(
        userId,
        'EARN_BONUS',
        points,
        `Admin adjust: ${reason}`,
        'admin-adjust',
        admin.id,
      );
      const account = await prisma.loyaltyAccount.findUnique({
        where: { userId },
        select: { balance: true },
      });
      newBalance = account?.balance ?? 0;
    } else {
      // Deduct — manual, clamp at 0
      const account = await prisma.loyaltyAccount.findUnique({ where: { userId } });
      if (!account) return errorJson('Оноо данс олдсонгүй', 404);

      const deduct = Math.abs(points);
      const actual = Math.min(account.balance, deduct);

      await prisma.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          balance: { decrement: actual },
          lifetimeSpent: { increment: actual },
        },
      });
      await prisma.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          type: 'ADJUST',
          points: -actual,
          description: `Admin adjust: ${reason}`,
        },
      });
      newBalance = account.balance - actual;
    }

    // Audit log
    try {
      await prisma.adminLog.create({
        data: {
          adminId: admin.id,
          action: 'loyalty.adjust',
          after: {
            userId,
            targetEmail: targetUser.email,
            points,
            newBalance,
          },
          note: reason,
        },
      });
    } catch (e) {
      console.error('AdminLog write failed:', e);
    }

    return json({
      userId,
      pointsAdjusted: points,
      newBalance,
      reason,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return errorJson(message, 500);
  }
}
