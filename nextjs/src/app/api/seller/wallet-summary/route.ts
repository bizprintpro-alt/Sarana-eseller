// Sarana eSeller BFF — GET /api/seller/wallet-summary
//
// Read-only summary forwarded from Negd. NOT the Sarana wallet endpoint.
// No payout, no withdraw, no Sarana wallet/ledger interaction.
// On dev (Negd unconfigured) we return a zeroed read-only fallback so the
// seller tabs render — no fake balances, just nulls/zeros.

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
    const result = await callNegdSellerEndpoint('wallet-summary', {
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
    console.warn('[seller/wallet-summary] Negd call threw, returning local fallback', {
      message: (e as Error)?.message,
      correlationId,
    });
  }

  return ok({
    balanceMnt: 0,
    pendingMnt: 0,
    paidOutMnt: 0,
    availableMnt: 0,
    currency: 'MNT',
    source: 'bff_local',
  });
}
