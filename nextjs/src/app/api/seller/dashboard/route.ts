// Sarana eSeller BFF — seller dashboard (PR105B)
// GET /api/seller/dashboard
//
// Strategy: Negd S2S first, Prisma local fallback.
//   1. If Negd is configured and returns 2xx, forward the decorated upstream
//      payload (PR102 contract preserved — this is the canonical path).
//   2. Otherwise (env not set / 5xx / network error) build a read-only
//      summary from Prisma so PR105B mobile flows are unblocked while Negd
//      rolls out per environment.
//
// TODO(BFF): once Negd internal eseller dashboard is GA everywhere, drop
// the Prisma fallback and rely on Negd as source-of-truth for live metrics.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSeller } from '@/lib/api-auth';
import { ok, fail } from '@/lib/api-envelope';
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

  // ── Path 1: Negd S2S ────────────────────────────────────────────────
  try {
    const result = await callNegdSellerEndpoint('dashboard', {
      eSellerUserId: auth.id,
      correlationId,
    });
    // Forward Negd's response only when it's a real upstream success.
    // The dev-mode empty stub (isDevStub=true, missing env vars) deliberately
    // falls through so local dev still gets the richer Prisma snapshot —
    // an empty {ok:true,data:null} would be a regression for this specific
    // route, which has its own fallback.
    if (result.status >= 200 && result.status < 300 && !result.isDevStub) {
      return NextResponse.json(decorateBff(result.body, result.correlationId), {
        status: result.status,
        headers: { 'X-Correlation-ID': correlationId },
      });
    }
    // Non-2xx OR dev stub → fall through to the Prisma fallback below.
    // callNegdSellerEndpoint has already logged any upstream errors.
  } catch (e: unknown) {
    console.warn('[seller/dashboard] Negd call threw, falling back to Prisma', {
      message: (e as Error)?.message,
      correlationId,
    });
  }

  // ── Path 2: Prisma fallback ─────────────────────────────────────────
  try {
    const [user, sellerProfile, shop] = await Promise.all([
      prisma.user.findUnique({
        where: { id: auth.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
        },
      }),
      prisma.sellerProfile.findUnique({
        where: { userId: auth.id },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          isVerified: true,
          isActive: true,
          sellerType: true,
          commissionRate: true,
          totalEarned: true,
          totalSales: true,
        },
      }),
      prisma.shop.findUnique({
        where: { userId: auth.id },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          isBlocked: true,
          locationStatus: true,
        },
      }),
    ]);

    if (!sellerProfile) return fail('SELLER_PROFILE_NOT_FOUND', 404);

    return ok({
      user,
      sellerProfile,
      shop,
      // TODO(BFF): live metrics (revenue / orders / payouts) come from Negd.
      // While Negd is unavailable in this environment, expose explicit nulls
      // so mobile renders a "no data yet" state instead of fabricated zeros.
      metrics: null,
      verification: {
        profile: sellerProfile.isVerified,
        location: shop?.locationStatus ?? null,
      },
      source: 'bff_local',
      correlationId,
    });
  } catch (e: unknown) {
    console.error('[seller/dashboard] Prisma fallback error', {
      message: (e as Error)?.message,
      correlationId,
    });
    return fail('Жагсаалт авахад алдаа гарлаа', 500);
  }
}
