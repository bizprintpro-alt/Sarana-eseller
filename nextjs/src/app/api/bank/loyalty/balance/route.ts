import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, json, errorJson } from '@/lib/api-auth';
import { getBankPoints, BANK_CONFIGS, type BankName } from '@/lib/bank-loyalty';

// POST /api/bank/loyalty/balance — check bank points
export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { bank, cardNumber } = await req.json();
  if (!bank || !cardNumber) return errorJson('bank + cardNumber шаардлагатай');

  const config = BANK_CONFIGS[bank as BankName];
  if (!config) return errorJson('Дэмжигдэхгүй банк');

  const points = await getBankPoints(bank as BankName, cardNumber);
  const convertedPoints = Math.floor(points * config.rate);

  return json({ bank, points, convertedPoints, rate: config.rate });
}
