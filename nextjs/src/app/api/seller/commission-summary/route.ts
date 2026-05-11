// Sarana eSeller BFF — GET /api/seller/commission-summary
//
// Read-only summary forwarded from Negd. No commission calculation,
// no posting, no ledger writes happen here. Local-dev fallback returns
// zeroed totals and an empty items array — no fabricated commissions.

import { NextRequest, NextResponse } from 'next/server';
import { requireSeller } from '@/lib/api-auth';
import { ok } from '@/lib/api-envelope';
import {
  callNegdSellerEndpoint,
  decorateBff,
  resolveCorrelationId,
} from '@/lib/negdSellerProxy';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const correlationId = resolveCorrelationId(req);

  const auth = requireSeller(req);
  if (auth instanceof Response) return auth;

  try {
    const result = await callNegdSellerEndpoint('commission-summary', {
      eSellerUserId: auth.id,
      correlationId,
    });
    if (result.status >= 200 && result.status < 300 && !result.isDevStub) {
      return NextResponse.json(decorateBff(result.body, result.correlationId), {
        status: result.status,
        headers: { 'X-Correlation-ID': correlationId },
      });
    }
  } catch (e: unknown) {
    console.warn('[seller/commission-summary] Negd call threw, returning local fallback', {
      message: (e as Error)?.message,
      correlationId,
    });
  }

  return ok({
    totalMnt: 0,
    pendingMnt: 0,
    paidMnt: 0,
    count: 0,
    items: [],
    source: 'bff_local',
  });
}
