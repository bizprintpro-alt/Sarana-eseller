import { getShopPlan, getPlatformConfig } from './subscription-server';

export async function calculateOrderCommission(
  shopId: string,
  orderTotal: number,
  hasAffiliate: boolean
) {
  const { commissionRate } = await getShopPlan(shopId);
  const affiliateRate = hasAffiliate
    ? ((await getPlatformConfig('affiliate_rate')) ?? 15)
    : 0;

  const platformAmount = Math.round(orderTotal * commissionRate / 100);
  const affiliateAmount = Math.round(orderTotal * affiliateRate / 100);
  const sellerAmount = orderTotal - platformAmount - affiliateAmount;

  return {
    platformAmount,
    sellerAmount,
    affiliateAmount,
    platformRate: commissionRate,
    affiliateRate,
  };
}
