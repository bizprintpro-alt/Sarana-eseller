import { NextRequest } from 'next/server';
import { requireAuth, json, errorJson } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { loyaltyService } from '@/lib/loyalty/LoyaltyService';

// POST /api/loyalty/redeem-cash
// Body: { points: number }
// Converts loyalty points directly into wallet balance.
export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof Response) return user;

  try {
    const body = await req.json();
    const { points } = body as { points?: number };

    // Validation
    if (typeof points !== 'number' || !Number.isFinite(points)) {
      return errorJson('points шаардлагатай', 400);
    }
    if (points < 500) {
      return errorJson('Хамгийн бага 500 оноо шаардлагатай', 400);
    }
    if (points % 100 !== 0) {
      return errorJson('100-ын үржвэр байх ёстой', 400);
    }

    // Ensure account + sufficient balance (pre-check for a clearer error)
    const account = await prisma.loyaltyAccount.findUnique({ where: { userId: user.id } });
    if (!account) {
      return errorJson('Оноо данс олдсонгүй', 404);
    }
    if (account.balance < points) {
      return errorJson(`Оноо хүрэлцэхгүй (${account.balance} оноо байна)`, 400);
    }

    // Run the redemption
    let cashAdded: number;
    try {
      cashAdded = await loyaltyService.redeemForCash(user.id, points);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Redemption алдаа';
      return errorJson(message, 500);
    }

    // Return updated balances so the client can refresh without a second round-trip
    const [updatedAccount, updatedWallet] = await Promise.all([
      prisma.loyaltyAccount.findUnique({ where: { userId: user.id } }),
      prisma.wallet.findUnique({ where: { userId: user.id } }),
    ]);

    return json({
      pointsUsed: points,
      cashAdded,
      pointBalance: updatedAccount?.balance ?? 0,
      walletBalance: updatedWallet?.balance ?? 0,
      message: `${points} оноо → ${cashAdded.toLocaleString()}₮ хэтэвчинд нэмэгдлээ`,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return errorJson(message, 500);
  }
}
