/**
 * Loyalty & Gold Membership configuration
 * Admin-configurable earn/redeem rules
 */

export const LOYALTY_CONFIG = {
  earn: {
    purchaseRate: 1,       // 1 оноо per 100₮
    reviewBonus: 100,
    firstPurchase: 500,
    profileComplete: 200,
    birthdayBonus: 1000,
    referralReferrer: 300,
    referralReferred: 200,
    streakBonus: { 3: 150, 7: 500, 30: 2000 } as Record<number, number>,
    goldMultiplier: 2,
    tierMultipliers: {
      BRONZE: 1.0,
      SILVER: 1.2,
      GOLD: 1.5,
      PLATINUM: 2.0,
    } as Record<string, number>,
  },

  redeem: {
    pointValue: 5,         // 1 оноо = 5₮
    minRedeemPoints: 200,
    maxRedeemPct: 30,      // Захиалгын 30% хүртэл
    freeShippingCost: 500,
  },

  tiers: {
    BRONZE:   { min: 0,     max: 4999,  label: 'Хүрэл',    color: '#CD7F32', emoji: '🥉' },
    SILVER:   { min: 5000,  max: 19999, label: 'Мөнгө',    color: '#C0C0C0', emoji: '🥈' },
    GOLD:     { min: 20000, max: 49999, label: 'Алт',       color: '#FFD700', emoji: '🥇' },
    PLATINUM: { min: 50000, max: null,  label: 'Платинум', color: '#E5E4E2', emoji: '💎' },
  } as Record<string, { min: number; max: number | null; label: string; color: string; emoji: string }>,

  expiryMonths: 12,

  gold: {
    plans: {
      MONTHLY:   { price: 19900,  duration: 30,  label: '1 сар',   saving: 0 },
      QUARTERLY: { price: 49900,  duration: 90,  label: '3 сар',   saving: 16 },
      ANNUAL:    { price: 149900, duration: 365, label: '1 жил',   saving: 37 },
    } as Record<string, { price: number; duration: number; label: string; saving: number }>,
    trialDays: 30,
    benefits: [
      { icon: 'Truck',     title: 'Үнэгүй хүргэлт',       desc: '50,000₮-с дээш захиалгад' },
      { icon: 'Zap',       title: 'Оноо 2x хурдтай',       desc: 'Захиалга бүрт 2 дахин оноо' },
      { icon: 'Clock',     title: 'Flash sale эрт хандах',   desc: 'Хямдрал эхлэхээс 2 цаг өмнө' },
      { icon: 'Tag',       title: '5-10% нэмэлт хямдрал',  desc: 'Gold гишүүдэд онцгой үнэ' },
      { icon: 'Star',      title: 'Сар бүр 500 бонус',      desc: 'Автомат бонус оноо' },
      { icon: 'RotateCcw', title: 'Эхний 3 буцаалт',        desc: 'Үнэгүй буцаалт эрх' },
    ],
  },
};

export function calculateTier(lifetimePoints: number): string {
  if (lifetimePoints >= 50000) return 'PLATINUM';
  if (lifetimePoints >= 20000) return 'GOLD';
  if (lifetimePoints >= 5000)  return 'SILVER';
  return 'BRONZE';
}

export function getTierProgress(lifetimePoints: number, currentTier: string): number {
  const tiers = LOYALTY_CONFIG.tiers;
  const current = tiers[currentTier];
  if (!current || current.max === null) return 100;
  const next = Object.values(tiers).find(t => t.min === (current.max || 0) + 1);
  if (!next) return 100;
  const range = next.min - current.min;
  const progress = lifetimePoints - current.min;
  return Math.min(100, Math.round((progress / range) * 100));
}
