import { prisma } from '@/lib/prisma';
import { LOYALTY_CONFIG, calculateTier } from './config';

export class LoyaltyService {
  /** Get or create loyalty account */
  async getOrCreate(userId: string) {
    return prisma.loyaltyAccount.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  /** Check if user has active Gold membership */
  async hasActiveGold(userId: string): Promise<boolean> {
    const m = await prisma.goldMembership.findUnique({ where: { userId } });
    return !!m && (m.status === 'ACTIVE' || m.status === 'TRIAL') && new Date(m.endsAt) > new Date();
  }

  /** Earn points */
  async earn(
    userId: string, type: string, basePoints: number,
    description: string, refType?: string, refId?: string,
  ) {
    const account = await this.getOrCreate(userId);
    const hasGold = await this.hasActiveGold(userId);
    const tierMult = LOYALTY_CONFIG.earn.tierMultipliers[account.tier] || 1;
    const goldMult = hasGold ? LOYALTY_CONFIG.earn.goldMultiplier : 1;
    const finalPoints = Math.round(basePoints * tierMult * goldMult);

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + LOYALTY_CONFIG.expiryMonths);

    const tx = await prisma.loyaltyTransaction.create({
      data: { accountId: account.id, type, points: finalPoints, description, refType, refId, expiresAt },
    });

    await prisma.loyaltyAccount.update({
      where: { id: account.id },
      data: {
        balance: { increment: finalPoints },
        lifetimeEarned: { increment: finalPoints },
        lastActivityAt: new Date(),
      },
    });

    // Check tier upgrade
    const updated = await prisma.loyaltyAccount.findUnique({ where: { id: account.id } });
    if (updated) {
      const newTier = calculateTier(updated.lifetimeEarned);
      if (newTier !== updated.tier) {
        await prisma.loyaltyAccount.update({
          where: { id: account.id },
          data: { tier: newTier, tierUpdatedAt: new Date() },
        });
      }
    }

    return { ...tx, finalPoints };
  }

  /** Earn from order purchase */
  async earnFromOrder(userId: string, orderId: string, amount: number) {
    const basePoints = Math.floor(amount / 100) * LOYALTY_CONFIG.earn.purchaseRate;
    return this.earn(userId, 'EARN_PURCHASE', basePoints,
      `Захиалга ${orderId} — ${amount.toLocaleString()}₮`, 'order', orderId);
  }

  /** Redeem points */
  async redeem(userId: string, points: number, type: string, orderId?: string) {
    const account = await this.getOrCreate(userId);

    if (account.balance < points) throw new Error('Оноо хүрэлцэхгүй');
    if (points < LOYALTY_CONFIG.redeem.minRedeemPoints) throw new Error(`Хамгийн бага ${LOYALTY_CONFIG.redeem.minRedeemPoints} оноо`);

    const valueAmount = points * LOYALTY_CONFIG.redeem.pointValue;
    const couponCode = `PTS${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const redemption = await prisma.loyaltyRedemption.create({
      data: { accountId: account.id, userId, type, pointsUsed: points, valueAmount, couponCode, expiresAt, orderId },
    });

    await prisma.loyaltyTransaction.create({
      data: { accountId: account.id, type: 'REDEEM_DISCOUNT', points: -points, description: `${points} оноо зарцуулав (${valueAmount.toLocaleString()}₮)` },
    });

    await prisma.loyaltyAccount.update({
      where: { id: account.id },
      data: { balance: { increment: -points }, lifetimeSpent: { increment: points } },
    });

    return redemption;
  }
}

export const loyaltyService = new LoyaltyService();
