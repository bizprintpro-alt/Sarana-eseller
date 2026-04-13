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

  // ═══ Subdomain routing for Enterprise shops ═══
  const subdomainMatch = hostname.match(/^(.+)\.eseller\.mn$/);
  if (subdomainMatch) {
    const subdomain = subdomainMatch[1];
    // Skip reserved subdomains
    if (!['www', 'admin', 'api', 'dashboard', 'mail', 'cdn'].includes(subdomain)) {
      const url = req.nextUrl.clone();
      url.pathname = `/enterprise/${subdomain}${pathname}`;
      const res = NextResponse.rewrite(url);
      res.headers.set('x-subdomain', subdomain);
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
