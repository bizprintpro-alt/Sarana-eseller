// Sarana eSeller BFF — GET /api/seller/lead-summary
//
// Read-only summary forwarded from Negd. Local-dev fallback returns zero
// counts and an empty items array — no fabricated leads.

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
    const result = await callNegdSellerEndpoint('lead-summary', {
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
    console.warn('[seller/lead-summary] Negd call threw, returning local fallback', {
      message: (e as Error)?.message,
      correlationId,
    });
  }

  return ok({
    totalLeads: 0,
    newLeads: 0,
    convertedLeads: 0,
    items: [],
    source: 'bff_local',
  });
}
