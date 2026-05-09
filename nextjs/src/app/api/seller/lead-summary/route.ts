// Sarana eSeller BFF — read-only seller proxy (PR102)
// GET /api/seller/lead-summary  →  Negd /api/internal/eseller/seller/lead-summary

import { NextRequest } from 'next/server';
import { handleSellerProxyGet } from '@/lib/negdSellerProxy';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleSellerProxyGet(req, 'lead-summary');
}
