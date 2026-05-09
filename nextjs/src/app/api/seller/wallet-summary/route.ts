// Sarana eSeller BFF — read-only seller proxy (PR102)
// GET /api/seller/wallet-summary  →  Negd /api/internal/eseller/seller/wallet-summary
//
// Read-only summary forwarded from Negd. NOT the Sarana wallet endpoint.
// No payout, no withdraw, no Sarana wallet/ledger interaction.

import { NextRequest } from 'next/server';
import { handleSellerProxyGet } from '@/lib/negdSellerProxy';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleSellerProxyGet(req, 'wallet-summary');
}
