// Sarana eSeller BFF — GET /api/seller/referral-summary
//
// Read-only summary forwarded from Negd. Local-dev fallback returns nulls
// for the referral code/link and zero counts — no fabricated invites.

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
    const result = await callNegdSellerEndpoint('referral-summary', {
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
    console.warn('[seller/referral-summary] Negd call threw, returning local fallback', {
      message: (e as Error)?.message,
      correlationId,
    });
  }

  return ok({
    code: null,
    link: null,
    totalReferrals: 0,
    activeReferrals: 0,
    source: 'bff_local',
  });
}
