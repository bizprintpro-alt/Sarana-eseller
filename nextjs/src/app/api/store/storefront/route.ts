import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/api-auth';

// GET — fetch current storefront config
export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const shop = await prisma.shop.findUnique({ where: { userId: user.id } });
  if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });

  return NextResponse.json({
    config: shop.storefrontConfig || null,
    slug: shop.storefrontSlug || shop.slug,
    isPublished: !!(shop.storefrontConfig as any)?.isPublished,
  });
}

// PUT — save storefront config
export async function PUT(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { config } = await req.json();
  if (!config) return NextResponse.json({ error: 'Config required' }, { status: 400 });

  const shop = await prisma.shop.findUnique({ where: { userId: user.id } });
  if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });

  await prisma.shop.update({
    where: { userId: user.id },
    data: {
      storefrontConfig: config,
      storefrontSlug: shop.storefrontSlug || shop.slug,
    },
  });

  return NextResponse.json({ success: true, message: 'Storefront хадгалагдлаа' });
}
