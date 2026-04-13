export type LiveScope = 'PUBLIC' | 'SHOP' | 'PRODUCT'
export type LivePlanKey = 'BASIC' | 'STANDARD' | 'PRO' | 'ENTERPRISE'

export const LIVE_PLANS: Record<LivePlanKey, {
  name: string; price: number; monthlyLive: number;
  scopes: LiveScope[]; badge: boolean; priority?: boolean;
  branded?: boolean; description: string;
}> = {
  BASIC: { name: 'Үндсэн', price: 0, monthlyLive: 1, scopes: ['PUBLIC'], badge: false, description: 'Сарын 1 нийтийн live' },
  STANDARD: { name: 'Стандарт', price: 50000, monthlyLive: 10, scopes: ['PUBLIC', 'SHOP'], badge: true, description: 'Сарын 10 live, дэлгүүрийн live' },
  PRO: { name: 'Про', price: 150000, monthlyLive: -1, scopes: ['PUBLIC', 'SHOP', 'PRODUCT'], badge: true, priority: true, description: 'Хязгааргүй, бараа live, нүүр байр' },
  ENTERPRISE: { name: 'Энтерпрайз', price: 500000, monthlyLive: -1, scopes: ['PUBLIC', 'SHOP', 'PRODUCT'], badge: true, priority: true, branded: true, description: 'Бүгд + брэндийн тохируулга' },
}

export function canCreateLive(shop: { livePlan: string; liveCount: number }, scope: LiveScope): { allowed: boolean; reason?: string } {
  const plan = LIVE_PLANS[shop.livePlan as LivePlanKey] || LIVE_PLANS.BASIC
  if (!plan.scopes.includes(scope)) {
    return { allowed: false, reason: `${scope} live хийхэд ${scope === 'PRODUCT' ? 'Про' : 'Стандарт'} багц шаардлагатай` }
  }
  if (plan.monthlyLive > 0 && shop.liveCount >= plan.monthlyLive) {
    return { allowed: false, reason: `Энэ сарын ${plan.monthlyLive} live дууссан. Багцаа шинэчилнэ үү.` }
  }
  return { allowed: true }
}
