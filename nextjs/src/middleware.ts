// ══════════════════════════════════════════════════════════════
// eseller.mn — Edge Middleware
// ДҮРЭМ: Зөвхөн routing шийдвэр. Prisma байхгүй. DB call байхгүй.
// ══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';

const RESERVED_SUBDOMAINS = new Set([
  'www', 'api', 'admin', 'dashboard', 'cdn', 'mail',
  'dev', 'staging', 'app', 'help', 'support', 'blog',
]);

const PLATFORM_HOSTS = new Set([
  'eseller.mn',
  'www.eseller.mn',
  'localhost',
  'localhost:3000',
  '127.0.0.1',
  '127.0.0.1:3000',
]);

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || '';
  const { pathname } = req.nextUrl;

  // ═══ CORS for API routes (mobile app support) ═══
  if (pathname.startsWith('/api/')) {
    const origin = req.headers.get('origin') || '';
    const allowedPrefixes = ['https://eseller.mn', 'http://localhost', 'exp://'];
    const isAllowed = allowedPrefixes.some((p) => origin.startsWith(p)) || !origin;
    const corsOrigin = isAllowed ? origin || '*' : 'https://eseller.mn';

    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': corsOrigin,
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', corsOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return response;
  }

  // ═══ Maintenance Mode (env-based, no DB call) ═══
  if (process.env.MAINTENANCE_MODE === 'true') {
    const skip = pathname.startsWith('/dashboard') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/maintenance') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon');
    if (!skip) {
      const url = req.nextUrl.clone();
      url.pathname = '/maintenance';
      return NextResponse.rewrite(url);
    }
  }

  // ═══ Subdomain routing (Edge — no DB) ═══

  // Production: nomin.eseller.mn → /shop-sub/nomin/...
  const prodMatch = hostname.match(/^([a-z0-9][a-z0-9-]+)\.eseller\.mn$/i);
  if (prodMatch) {
    const slug = prodMatch[1].toLowerCase();
    if (!RESERVED_SUBDOMAINS.has(slug)) {
      return rewriteToShop(req, slug, pathname);
    }
  }

  // Dev: nomin.localhost:3000 → /shop-sub/nomin/...
  const devMatch = hostname.match(/^([a-z0-9][a-z0-9-]+)\.localhost(?::\d+)?$/i);
  if (devMatch) {
    const slug = devMatch[1].toLowerCase();
    if (!RESERVED_SUBDOMAINS.has(slug)) {
      return rewriteToShop(req, slug, pathname);
    }
  }

  // Skip platform's own domains
  if (PLATFORM_HOSTS.has(hostname) || PLATFORM_HOSTS.has(hostname.split(':')[0])) {
    return NextResponse.next();
  }

  // Skip Vercel preview URLs
  if (hostname.includes('vercel.app') || hostname.includes('vercel-') || hostname.includes('.local')) {
    return NextResponse.next();
  }

  // Custom domain: shop.nomin.mn → /shop-sub/_custom/...
  if (!hostname.includes('eseller.mn') && !hostname.includes('localhost')) {
    const url = req.nextUrl.clone();
    url.pathname = `/shop-sub/_custom${pathname === '/' ? '' : pathname}`;
    const res = NextResponse.rewrite(url);
    res.headers.set('x-custom-domain', hostname);
    return res;
  }

  return NextResponse.next();
}

/** Rewrite to /shop-sub/[slug] — shared by prod + dev */
function rewriteToShop(req: NextRequest, slug: string, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = `/shop-sub/${slug}${pathname === '/' ? '' : pathname}`;
  const res = NextResponse.rewrite(url);
  res.headers.set('x-shop-slug', slug);
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
