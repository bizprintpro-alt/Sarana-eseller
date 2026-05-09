// Sarana eSeller BFF — read-only seller proxy (PR102)
// GET /api/seller/dashboard  →  Negd /api/internal/eseller/seller/dashboard

import { NextRequest } from 'next/server';
import { handleSellerProxyGet } from '@/lib/negdSellerProxy';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleSellerProxyGet(req, 'dashboard');
}
