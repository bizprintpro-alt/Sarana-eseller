// Sarana eSeller BFF — read-only seller proxy (PR102)
// GET /api/seller/commission-summary  →  Negd /api/internal/eseller/seller/commission-summary
//
// Read-only summary forwarded from Negd. No commission calculation,
// no posting, no ledger writes happen here.

import { NextRequest } from 'next/server';
import { handleSellerProxyGet } from '@/lib/negdSellerProxy';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleSellerProxyGet(req, 'commission-summary');
}
