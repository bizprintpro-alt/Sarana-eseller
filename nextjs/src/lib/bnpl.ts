// ══════════════════════════════════════════════════════════════
// eseller.mn — BNPL (Buy Now Pay Later) calculator
// ══════════════════════════════════════════════════════════════

export interface BNPLCalculation {
  monthly: number;
  total: number;
  interest: number;
  downPayment: number;
}

/**
 * Calculate BNPL monthly payment using amortization formula.
 * @param amount - Total order amount (MNT)
 * @param months - Number of installments (3, 6, or 12)
 * @returns Monthly payment, total, interest, and down payment
 */
export function calculateBNPL(amount: number, months: number): BNPLCalculation {
  const rate = 0.015; // 1.5% monthly interest
  const financed = amount * 0.9; // 90% financed, 10% down
  const monthly = financed * rate / (1 - Math.pow(1 + rate, -months));
  return {
    monthly: Math.ceil(monthly),
    total: Math.ceil(monthly * months + amount * 0.1),
    interest: Math.ceil(monthly * months - financed),
    downPayment: Math.ceil(amount * 0.1),
  };
}

export const BNPL_BANKS = [
  { id: 'KHAN', name: 'Хаан банк' },
  { id: 'GOLOMT', name: 'Голомт банк' },
  { id: 'TDB', name: 'ТДБ банк' },
  { id: 'HAS', name: 'ХАС банк' },
] as const;

export const BNPL_MONTHS = [3, 6, 12] as const;
