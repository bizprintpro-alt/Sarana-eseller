import { prisma } from '@/lib/prisma';
import { LOYALTY_CONFIG } from './config';
import { loyaltyService } from './LoyaltyService';

export class GoldService {
  /** Start free trial */
  async startTrial(userId: string) {
    const existing = await prisma.goldMembership.findUnique({ where: { userId } });
    if (existing) throw new Error('Та өмнө нь Gold гишүүнчлэлтэй байсан');

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + LOYALTY_CONFIG.gold.trialDays);

    const membership = await prisma.goldMembership.create({
      data: {
        userId, plan: 'MONTHLY', status: 'TRIAL',
        startsAt: new Date(), endsAt: trialEndsAt,
        trialEndsAt, isTrial: true, autoRenew: true,
      },
    });

    await loyaltyService.earn(userId, 'EARN_BONUS', 500, 'Gold туршилт эхэллээ 🎉');
    return membership;
  }

  /** Activate membership (after payment) */
  async activate(userId: string, plan: string, paymentId: string) {
    const planConfig = LOYALTY_CONFIG.gold.plans[plan];
    if (!planConfig) throw new Error('Буруу төлөвлөгөө');

    const now = new Date();
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + planConfig.duration);

    const membership = await prisma.goldMembership.upsert({
      where: { userId },
      create: {
        userId, plan, status: 'ACTIVE',
        startsAt: now, endsAt, isTrial: false, autoRenew: true,
      },
      update: {
        plan, status: 'ACTIVE', endsAt, isTrial: false,
      },
    });

    await prisma.membershipPayment.create({
      data: { membershipId: membership.id, amount: planConfig.price, plan, method: 'qpay', refId: paymentId },
    });

    await loyaltyService.earn(userId, 'EARN_BONUS', 500, 'Gold гишүүнчлэл идэвхжлээ 🥇');
    return membership;
  }

  /** Cancel membership */
  async cancel(userId: string) {
    await prisma.goldMembership.update({
      where: { userId },
      data: { status: 'CANCELLED', autoRenew: false },
    });
  }

  /** Get membership status */
  async getStatus(userId: string) {
    return prisma.goldMembership.findUnique({ where: { userId }, include: { payments: { take: 5, orderBy: { paidAt: 'desc' } } } });
  }
}

export const goldService = new GoldService();
