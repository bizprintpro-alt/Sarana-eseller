// ══════════════════════════════════════════════════════════════
// Sarana eSeller BFF — server-only Negd S2S seller proxy client
// PR102. Read-only. GET only. No mutation.
//
// Reads NEGD_INTERNAL_BASE_URL and ESELLER_S2S_INTEGRATION_KEY.
// Never logs or returns the integration key. Mobile never sees it.
// ══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from './api-auth';

const NEGD_BASE = (process.env.NEGD_INTERNAL_BASE_URL || '').replace(/\/+$/, '');
const S2S_KEY_PRESENT = Boolean(process.env.ESELLER_S2S_INTEGRATION_KEY);
const TIMEOUT_MS = 8_000;

export type NegdSellerEndpoint =
  | 'me'
  | 'dashboard'
  | 'wallet-summary'
  | 'referral-summary'
  | 'lead-summary'
  | 'commission-summary';

export interface NegdProxyResult {
  status: number;
  body: unknown;
  correlationId: string;
  /** True when the helper produced the local-dev empty-success stub
   *  because NEGD_INTERNAL_BASE_URL / ESELLER_S2S_INTEGRATION_KEY are
   *  unset. Routes that have a richer fallback (e.g. /api/seller/dashboard
   *  → Prisma) check this and fall through; routes with no fallback just
   *  return the stub. */
  isDevStub?: boolean;
}

/** Resolve the inbound correlation id, or generate one. */
export function resolveCorrelationId(req: NextRequest): string {
  return (
    req.headers.get('x-correlation-id') ||
    req.headers.get('X-Correlation-ID') ||
    crypto.randomUUID()
  );
}

/** Build an UNAUTHENTICATED failure envelope. */
export function unauthenticatedEnvelope(correlationId: string) {
  return {
    ok: false,
    error: { code: 'UNAUTHENTICATED', message: 'Authentication required' },
    correlationId,
  };
}

/** Build a BFF_UPSTREAM_UNAVAILABLE failure envelope. */
export function upstreamUnavailableEnvelope(correlationId: string, message?: string) {
  return {
    ok: false,
    error: {
      code: 'BFF_UPSTREAM_UNAVAILABLE',
      message: message || 'Upstream Negd service is unavailable',
    },
    correlationId,
    bff: 'sarana-eseller',
    upstream: 'negd',
  };
}

/**
 * Empty-success envelope returned in development when Negd S2S env vars
 * aren't set. Lets `npm run dev` boot without spamming 503s on every
 * seller-tab fetch — production still gets the 503 so ops sees a real
 * config gap. Mobile reads `data: null` and renders empty state.
 */
export function devNegdMissingEnvelope(correlationId: string) {
  return {
    ok: true,
    data: null,
    correlationId,
    bff: 'sarana-eseller',
    upstream: 'negd-not-configured',
    devNote: 'Negd S2S env vars are unset; this is a local-dev empty stub',
  };
}

/** Build an INTERNAL_ERROR failure envelope. */
export function internalErrorEnvelope(correlationId: string) {
  return {
    ok: false,
    error: { code: 'INTERNAL_ERROR', message: 'Internal error' },
    correlationId,
    bff: 'sarana-eseller',
    upstream: 'negd',
  };
}

/**
 * Call a Negd internal S2S read-only seller endpoint.
 *
 * GET only. Server-side only. Never invoked from the browser.
 * The integration key is read from env and never logged or returned.
 */
export async function callNegdSellerEndpoint(
  endpoint: NegdSellerEndpoint,
  opts: { eSellerUserId: string; correlationId: string }
): Promise<NegdProxyResult> {
  const { eSellerUserId, correlationId } = opts;

  if (!NEGD_BASE || !S2S_KEY_PRESENT) {
    // In production a missing env is a real ops gap → keep the 503 so
    // monitoring fires. In development (npm run dev / EAS preview), there
    // is no Negd to talk to anyway, so 503 just clutters logs and turns
    // every mobile seller tab into an error toast. Return an empty 200
    // stub instead — mobile will render an empty state.
    if (process.env.NODE_ENV === 'production') {
      console.error('[negdSellerProxy] Missing NEGD_INTERNAL_BASE_URL or ESELLER_S2S_INTEGRATION_KEY');
      return {
        status: 503,
        body: upstreamUnavailableEnvelope(correlationId, 'Negd S2S not configured'),
        correlationId,
      };
    }
    console.warn('[negdSellerProxy] dev mode — Negd env unset, returning empty 200 stub');
    return {
      status: 200,
      body: devNegdMissingEnvelope(correlationId),
      correlationId,
      isDevStub: true,
    };
  }

  const url = `${NEGD_BASE}/api/internal/eseller/seller/${endpoint}`;
  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        // Server secret. Never forwarded to mobile, never logged.
        Authorization: `Bearer ${process.env.ESELLER_S2S_INTEGRATION_KEY}`,
        'X-ESELLER-USER-ID': eSellerUserId,
        'X-ESELLER-PROVIDER': 'ESELLER_MOBILE',
        'X-ESELLER-TIMESTAMP': timestamp,
        'X-ESELLER-REQUEST-ID': requestId,
        'X-CORRELATION-ID': correlationId,
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    });

    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    if (!res.ok && (body == null || typeof body !== 'object')) {
      return {
        status: 502,
        body: upstreamUnavailableEnvelope(correlationId, `Upstream ${res.status}`),
        correlationId,
      };
    }

    return { status: res.status, body, correlationId };
  } catch (err) {
    const aborted = (err as { name?: string } | null)?.name === 'AbortError';
    console.error(
      '[negdSellerProxy] upstream call failed',
      JSON.stringify({
        endpoint,
        correlationId,
        requestId,
        aborted,
        message: (err as Error)?.message,
      })
    );
    return {
      status: 504,
      body: upstreamUnavailableEnvelope(correlationId, aborted ? 'Upstream timeout' : 'Upstream error'),
      correlationId,
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Decorate a Negd response body with BFF metadata, preserving the upstream envelope. */
export function decorateBff(body: unknown, correlationId: string): unknown {
  if (body && typeof body === 'object') {
    const obj = body as Record<string, unknown>;
    return {
      ...obj,
      correlationId: obj.correlationId ?? correlationId,
      bff: 'sarana-eseller',
      upstream: 'negd',
    };
  }
  return upstreamUnavailableEnvelope(correlationId, 'Malformed upstream response');
}

/**
 * Shared GET handler for Sarana BFF read-only seller proxy routes.
 *
 * - validates existing mobile Bearer token via getAuthUser
 * - derives the eSeller user id server-side (never from client header/body)
 * - calls the matching Negd internal S2S endpoint
 * - forwards the upstream status + decorated envelope to mobile
 */
export async function handleSellerProxyGet(
  req: NextRequest,
  endpoint: NegdSellerEndpoint
): Promise<NextResponse> {
  const correlationId = resolveCorrelationId(req);

  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json(unauthenticatedEnvelope(correlationId), {
      status: 401,
      headers: { 'X-Correlation-ID': correlationId },
    });
  }

  try {
    const result = await callNegdSellerEndpoint(endpoint, {
      eSellerUserId: user.id,
      correlationId,
    });
    return NextResponse.json(decorateBff(result.body, result.correlationId), {
      status: result.status,
      headers: { 'X-Correlation-ID': correlationId },
    });
  } catch (err) {
    console.error(
      '[negdSellerProxy] handler error',
      JSON.stringify({ endpoint, correlationId, message: (err as Error)?.message })
    );
    return NextResponse.json(internalErrorEnvelope(correlationId), {
      status: 500,
      headers: { 'X-Correlation-ID': correlationId },
    });
  }
}
