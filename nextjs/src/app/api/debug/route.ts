import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/debug?slug=sarana-fashion — test shop lookup (temporary)
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') || 'sarana-fashion';

  try {
    const shop = await prisma.shop.findFirst({
      where: { OR: [{ slug }, { storefrontSlug: slug }] },
      select: { id: true, name: true, slug: true, storefrontSlug: true, industry: true, userId: true },
    });

    if (!shop) return NextResponse.json({ found: false, slug });

    const productCount = await prisma.product.count({ where: { userId: shop.userId, isActive: true } });

    return NextResponse.json({ found: true, shop, productCount, dbOk: true });
  } catch (e) {
    return NextResponse.json({ found: false, slug, error: (e as Error).message, dbOk: false });
  }
}
