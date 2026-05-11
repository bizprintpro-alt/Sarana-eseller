// Sarana eSeller BFF — GET /api/seller/me
//
// Read-only proxy to Negd `/api/internal/eseller/seller/me`. When Negd is
// unconfigured (local dev / preview without S2S env) the proxy short-circuits
// with isDevStub; we substitute a route-specific empty payload so mobile
// renders an empty state instead of an upstream-unavailable error.

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
    const result = await callNegdSellerEndpoint('me', {
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
    console.warn('[seller/me] Negd call threw, returning local fallback', {
      message: (e as Error)?.message,
      correlationId,
    });
  }

  return ok({
    profile: null,
    identityLink: null,
    verification: { isVerified: false, kycStatus: 'pending' },
    source: 'bff_local',
  });
}
