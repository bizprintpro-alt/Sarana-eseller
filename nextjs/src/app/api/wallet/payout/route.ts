import { NextRequest } from 'next/server';
import { requireAuth, json, errorJson } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { WalletHistoryEntry } from '@/lib/wallet-escrow';
import { Prisma } from '@prisma/client';

// POST /api/wallet/payout — request bank payout (admin-approved)
// Stricter validation than legacy POST /api/wallet (min 10K, explicit fields)
export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof Response) return user;

  try {
    const { amount, bankName, bankAccount } = await req.json();

    if (!amount || typeof amount !== 'number' || amount < 10000) {
      return errorJson('Хамгийн бага 10,000₮ гаргана', 400);
    }
    if (!bankName?.trim() || !bankAccount?.trim()) {
      return errorJson('Банк болон дансны дугаар шаардлагатай', 400);
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance < amount) {
      return errorJson('Үлдэгдэл хүрэлцэхгүй', 400);
    }

    const entry: WalletHistoryEntry = {
      type: 'PAYOUT',
      amount: -amount,
      description: `${bankName} ${bankAccount} руу шилжүүлэг`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    const updated = await prisma.wallet.update({
      where: { userId: user.id },
      data: {
        balance: { decrement: amount },
        history: { push: entry as unknown as Prisma.InputJsonValue },
      },
    });

    // TODO: bank transfer API integration (Khan/Golomt/TDB)
    // await bankTransfer({ bankName, bankAccount, amount })

    return json({
      newBalance: updated.balance,
      message: '1-3 ажлын өдрийн дотор шилжих болно',
    });
  } catch (e) {
    return errorJson((e as Error).message, 500);
  }
}
