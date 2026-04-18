/**
 * Wallet escrow helpers — buyer-seller fund flow
 *
 * Adapts to existing Wallet { balance, pending, escrowHold, history: Json[] }.
 * All transaction records are pushed into history[] (inline Json) to match
 * the existing `/api/wallet` GET convention.
 */
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export interface WalletHistoryEntry {
  type: 'TOPUP' | 'ESCROW_HOLD' | 'ESCROW_RELEASE' | 'ESCROW_REFUND' | 'PAYOUT' | 'POINTS_REDEEM' | 'CASHBACK';
  amount: number;
  orderId?: string;
  reference?: string;
  description?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  method?: string;
  createdAt: string;
}

/** Narrow our typed entry to Prisma's InputJsonValue when pushing into Json[] */
const asJson = (e: WalletHistoryEntry) => e as unknown as Prisma.InputJsonValue;

/** Get or create wallet for a user */
export async function getOrCreateWallet(userId: string) {
  return prisma.wallet.upsert({
    where: { userId },
    create: { userId, balance: 0, pending: 0, escrowHold: 0, history: [] },
    update: {},
  });
}

/** Buyer purchase — move funds from balance into escrow hold. Atomic check-and-decrement. */
export async function holdForEscrow(userId: string, orderId: string, amount: number) {
  if (amount <= 0) throw new Error('Дүн буруу байна');
  await getOrCreateWallet(userId);

  const entry: WalletHistoryEntry = {
    type: 'ESCROW_HOLD',
    amount: -amount,
    orderId,
    description: `Захиалга #${orderId} — Escrow хүлээлт`,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  // Conditional update — only succeeds when balance >= amount
  const updated = await prisma.wallet.updateMany({
    where: { userId, balance: { gte: amount } },
    data: {
      balance: { decrement: amount },
      escrowHold: { increment: amount },
      history: { push: asJson(entry) },
    },
  });

  if (updated.count === 0) {
    throw new Error('Үлдэгдэл хүрэлцэхгүй');
  }

  return prisma.wallet.findUnique({ where: { userId } });
}

/**
 * Release escrow after delivery confirmation.
 * • Buyer escrowHold decreases
 * • Seller balance increases by (amount - platformFee - affiliateFee)
 */
export async function releaseEscrow(
  orderId: string,
  buyerId: string,
  sellerId: string,
  amount: number,
  platformFee: number,
  affiliateFee: number = 0,
) {
  const sellerNet = amount - platformFee - affiliateFee;
  const now = new Date().toISOString();

  const buyerEntry: WalletHistoryEntry = {
    type: 'ESCROW_RELEASE',
    amount: -amount,
    orderId,
    description: `Захиалга #${orderId} — Escrow суллагдсан`,
    status: 'COMPLETED',
    createdAt: now,
  };
  const sellerEntry: WalletHistoryEntry = {
    type: 'ESCROW_RELEASE',
    amount: sellerNet,
    orderId,
    description: `Захиалга #${orderId} — Цэвэр орлого (комисс ${platformFee}₮ хасагдсан)`,
    status: 'COMPLETED',
    createdAt: now,
  };

  // Ensure seller wallet exists before atomic transfer
  await getOrCreateWallet(sellerId);

  // Atomic two-sided transfer — buyer escrow must have sufficient hold
  const result = await prisma.$transaction(async (tx) => {
    const buyerUpdate = await tx.wallet.updateMany({
      where: { userId: buyerId, escrowHold: { gte: amount } },
      data: {
        escrowHold: { decrement: amount },
        history: { push: asJson(buyerEntry) },
      },
    });
    if (buyerUpdate.count === 0) {
      throw new Error('Худалдан авагчийн escrow дүн хүрэлцэхгүй');
    }

    await tx.wallet.update({
      where: { userId: sellerId },
      data: {
        balance: { increment: sellerNet },
        history: { push: asJson(sellerEntry) },
      },
    });

    return { sellerNet, platformFee, affiliateFee };
  });

  return result;
}

/** Refund escrow back to buyer — atomic check on escrow hold */
export async function refundEscrow(orderId: string, buyerId: string, amount: number) {
  if (amount <= 0) throw new Error('Дүн буруу байна');

  const entry: WalletHistoryEntry = {
    type: 'ESCROW_REFUND',
    amount,
    orderId,
    description: `Захиалга #${orderId} — Буцаалт`,
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
  };

  const updated = await prisma.wallet.updateMany({
    where: { userId: buyerId, escrowHold: { gte: amount } },
    data: {
      balance: { increment: amount },
      escrowHold: { decrement: amount },
      history: { push: asJson(entry) },
    },
  });

  if (updated.count === 0) {
    throw new Error('Escrow дүн хүрэлцэхгүй — буцаалт хийх боломжгүй');
  }

  return prisma.wallet.findUnique({ where: { userId: buyerId } });
}
