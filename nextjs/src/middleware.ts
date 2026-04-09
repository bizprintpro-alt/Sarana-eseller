import { NextRequest, NextResponse } from 'next/server';

const PLATFORM_HOSTS = new Set([
  'eseller.mn',
  'www.eseller.mn',
  'localhost',
  'localhost:3000',
  '127.0.0.1',
  '127.0.0.1:3000',
]);

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') || '';
  const hostWithoutPort = hostname.split(':')[0];
  const { pathname } = req.nextUrl;

  // ═══ Maintenance Mode Check (env-based, no DB call) ═══
  if (process.env.MAINTENANCE_MODE === 'true') {
    const skipMaintenance = pathname.startsWith('/dashboard') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/maintenance') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon');

    if (!skipMaintenance) {
      const url = req.nextUrl.clone();
      url.pathname = '/maintenance';
      return NextResponse.rewrite(url);
    }
  }

  // Skip platform's own domains
  if (PLATFORM_HOSTS.has(hostname) || PLATFORM_HOSTS.has(hostWithoutPort)) {
    return NextResponse.next();
  }

  // Skip Vercel preview URLs
  if (hostname.includes('vercel.app') || hostname.includes('vercel-') || hostname.includes('.local')) {
    return NextResponse.next();
  }

  // *.eseller.mn subdomain → rewrite to /s/[slug]
  if (hostWithoutPort.endsWith('.eseller.mn')) {
    const slug = hostWithoutPort.replace('.eseller.mn', '');
    if (slug && slug !== 'www') {
      const url = req.nextUrl.clone();
      url.pathname = `/s/${slug}${req.nextUrl.pathname === '/' ? '' : req.nextUrl.pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Custom domain → DB lookup → rewrite to /[slug] storefront
  try {
    const origin = req.nextUrl.origin;
    const lookupUrl = new URL('/api/shop-domain-lookup', origin);
    lookupUrl.searchParams.set('domain', hostWithoutPort);

    const res = await fetch(lookupUrl.toString(), {
      headers: { 'x-middleware-secret': process.env.MIDDLEWARE_SECRET || 'eseller-internal' },
    });

    if (res.ok) {
      const { data } = await res.json();
      if (data?.slug) {
        const url = req.nextUrl.clone();
        // Try storefront slug first, fallback to /s/[slug]
        const storefrontSlug = data.storefrontSlug || data.slug;
        url.pathname = `/${storefrontSlug}${req.nextUrl.pathname === '/' ? '' : req.nextUrl.pathname}`;
        return NextResponse.rewrite(url);
      }
    }
  } catch {
    // Fall through
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
