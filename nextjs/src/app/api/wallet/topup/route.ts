import { NextRequest } from 'next/server';
import { requireAuth, json, errorJson } from '@/lib/api-auth';
import { getOrCreateWallet, WalletHistoryEntry } from '@/lib/wallet-escrow';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { loyaltyService } from '@/lib/loyalty/LoyaltyService';

// POST /api/wallet/topup — top up wallet via QPay/SocialPay/Card
export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof Response) return user;

  try {
    const { amount, method, reference } = await req.json();

    if (!amount || typeof amount !== 'number' || amount < 1000) {
      return errorJson('Хамгийн бага 1,000₮ цэнэглэнэ', 400);
    }
    const validMethods = ['qpay', 'socialpay', 'card'];
    if (!validMethods.includes(method)) {
      return errorJson('Буруу төлбөрийн арга', 400);
    }

    // Verify payment succeeded server-side before crediting.
    // Client must pass the PaymentTransaction.id (reference) of a PAID topup invoice.
    if (!reference) {
      return errorJson('Төлбөрийн баталгаа шаардлагатай', 400);
    }
    const paymentTx = await prisma.paymentTransaction.findFirst({
      where: { id: reference, status: 'PAID' },
    });
    if (!paymentTx) {
      return errorJson('Төлбөр баталгаажаагүй байна', 402);
    }
    if (paymentTx.amount !== amount) {
      return errorJson('Төлбөрийн дүн таарахгүй байна', 400);
    }
    // Idempotency — refuse to credit the same PaymentTransaction twice
    const existingWallet = await getOrCreateWallet(user.id);
    const history = (existingWallet.history as unknown as WalletHistoryEntry[]) || [];
    if (history.some((h) => h.type === 'TOPUP' && h.reference === reference)) {
      return json({ balance: existingWallet.balance, message: 'Цэнэглэлт аль хэдийн бүртгэгдсэн' });
    }

    const entry: WalletHistoryEntry = {
      type: 'TOPUP',
      amount,
      reference,
      description: `${method.toUpperCase()}-р цэнэглэлт`,
      method,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    };

    const updated = await prisma.wallet.update({
      where: { id: existingWallet.id },
      data: {
        balance: { increment: amount },
        history: { push: entry as unknown as Prisma.InputJsonValue },
      },
    });

    // Bonus loyalty points for large top-ups by active Gold members (200K+)
    if (amount >= 200000) {
      const hasGold = await loyaltyService.hasActiveGold(user.id);
      if (hasGold) {
        try {
          await loyaltyService.earn(
            user.id,
            'EARN_BONUS',
            500,
            `Цэнэглэлтийн бонус (${amount.toLocaleString()}₮)`,
            'topup',
            reference,
          );
        } catch (e) {
          console.error('Topup bonus points failed:', e);
        }
      }
    }

    return json({
      balance: updated.balance,
      message: `${amount.toLocaleString()}₮ амжилттай цэнэглэгдлээ`,
    });
  } catch (e) {
    console.error('[wallet/topup]', e);
    return errorJson('Серверийн алдаа', 500);
  }
}
