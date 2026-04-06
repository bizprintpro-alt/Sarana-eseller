import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

function getUserFromToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET || 'secret') as { userId?: string; id?: string };
    return decoded.userId || decoded.id || null;
  } catch { return null; }
}

// GET — fetch current storefront config
export async function GET(req: NextRequest) {
  const userId = getUserFromToken(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const shop = await prisma.shop.findUnique({ where: { userId } });
  if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });

  return NextResponse.json({
    config: shop.storefrontConfig || null,
    slug: shop.storefrontSlug || shop.slug,
    isPublished: !!(shop.storefrontConfig as any)?.isPublished,
  });
}

// PUT — save storefront config
export async function PUT(req: NextRequest) {
  const userId = getUserFromToken(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { config } = await req.json();
  if (!config) return NextResponse.json({ error: 'Config required' }, { status: 400 });

  const shop = await prisma.shop.findUnique({ where: { userId } });
  if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });

  await prisma.shop.update({
    where: { userId },
    data: {
      storefrontConfig: config,
      storefrontSlug: shop.storefrontSlug || shop.slug,
    },
  });

  return NextResponse.json({ success: true, message: 'Storefront хадгалагдлаа' });
}
