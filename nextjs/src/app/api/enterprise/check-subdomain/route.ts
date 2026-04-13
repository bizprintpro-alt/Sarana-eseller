import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const RESERVED = new Set(['www', 'admin', 'api', 'dashboard', 'mail', 'cdn', 'app', 'help', 'support', 'blog']);

// GET /api/enterprise/check-subdomain?subdomain=xxx
export async function GET(req: NextRequest) {
  const subdomain = req.nextUrl.searchParams.get('subdomain')?.toLowerCase().trim();
  if (!subdomain) return NextResponse.json({ available: false, error: 'Subdomain шаардлагатай' });

  if (!/^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/.test(subdomain)) {
    return NextResponse.json({ available: false, error: 'Зөвхөн жижиг үсэг, тоо, зураас ашиглана (3-32 тэмдэгт)' });
  }

  if (RESERVED.has(subdomain)) {
    return NextResponse.json({ available: false, error: 'Энэ нэр ашиглах боломжгүй' });
  }

  const existing = await prisma.enterpriseShop.findUnique({ where: { subdomain } });
  return NextResponse.json({ available: !existing });
}
