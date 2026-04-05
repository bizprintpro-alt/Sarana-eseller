export interface CommissionBreakdown {
  orderAmount: number;
  shopAmount: number;
  sellerAmount: number;
  platformAmount: number;
  sellerRate: number;
  platformRate: number;
}

export function calculateCommission(
  orderAmount: number,
  sellerRate: number,
  platformRate: number = 2.5,
): CommissionBreakdown {
  const sellerAmount = orderAmount * (sellerRate / 100);
  const platformAmount = orderAmount * (platformRate / 100);
  const shopAmount = orderAmount - sellerAmount - platformAmount;

  return {
    orderAmount,
    shopAmount: Math.round(shopAmount),
    sellerAmount: Math.round(sellerAmount),
    platformAmount: Math.round(platformAmount),
    sellerRate,
    platformRate,
  };
}
