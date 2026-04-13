/**
 * Bank Loyalty Point Integration
 * Supports: Khan Bank, Golomt, TDB
 */

import { prisma } from '@/lib/prisma';

export type BankName = 'KHAN' | 'GOLOMT' | 'TDB' | 'HAS' | 'ARIG' | 'CAPITRON';

export const BANK_CONFIGS: Record<string, { name: string; rate: number; logo: string }> = {
  KHAN: { name: 'Хаан банк', rate: 1.5, logo: '/banks/khan.png' },
  GOLOMT: { name: 'Голомт банк', rate: 1.2, logo: '/banks/golomt.png' },
  TDB: { name: 'ТДБ банк', rate: 1.0, logo: '/banks/tdb.png' },
  HAS: { name: 'ХАС банк', rate: 1.0, logo: '/banks/has.png' },
  ARIG: { name: 'Ариг банк', rate: 0.8, logo: '/banks/arig.png' },
  CAPITRON: { name: 'Капитрон банк', rate: 0.8, logo: '/banks/capitron.png' },
};

function getBankEnv(bank: string) {
  const prefix = bank.toUpperCase();
  return {
    apiUrl: process.env[`${prefix}_BANK_API_URL`] || '',
    apiKey: process.env[`${prefix}_BANK_API_KEY`] || '',
  };
}

/** Check bank points balance */
export async function getBankPoints(bank: BankName, cardNumber: string): Promise<number> {
  const env = getBankEnv(bank);
  if (!env.apiUrl || !env.apiKey) {
    // Demo mode
    console.log(`[BANK DEMO] ${bank} balance check for ${cardNumber.slice(-4)}`);
    return Math.floor(1000 + Math.random() * 9000);
  }

  try {
    const res = await fetch(`${env.apiUrl}/points/balance`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardNumber }),
    });
    const data = await res.json();
    return data.points ?? 0;
  } catch (err) {
    console.error(`[BANK] ${bank} balance error:`, err);
    return 0;
  }
}

/** Convert bank points to eseller points */
export async function convertBankPoints(
  userId: string,
  bank: BankName,
  bankPoints: number,
  cardNumber: string
): Promise<{ esellerPoints: number }> {
  const config = BANK_CONFIGS[bank];
  if (!config) throw new Error('Дэмжигдэхгүй банк');

  const env = getBankEnv(bank);
  const esellerPoints = Math.floor(bankPoints * config.rate);

  // Redeem from bank (production)
  if (env.apiUrl && env.apiKey) {
    const res = await fetch(`${env.apiUrl}/points/redeem`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardNumber, points: bankPoints }),
    });
    if (!res.ok) throw new Error('Банкны оноо хасахад алдаа гарлаа');
  }

  // Add to eseller loyalty
  const loyalty = await prisma.loyaltyAccount.findFirst({ where: { userId } });
  if (loyalty) {
    await prisma.loyaltyAccount.update({
      where: { id: loyalty.id },
      data: { balance: { increment: esellerPoints }, lifetimeEarned: { increment: esellerPoints } },
    });
  } else {
    await prisma.loyaltyAccount.create({
      data: { userId, balance: esellerPoints, lifetimeEarned: esellerPoints },
    });
  }

  // Record transaction
  await prisma.bankLoyaltyTransaction.create({
    data: { userId, bank, bankPoints, esellerPoints, rate: config.rate },
  });

  return { esellerPoints };
}
