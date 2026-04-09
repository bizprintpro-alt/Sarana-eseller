import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/debug — comprehensive DB check (temporary)
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') || 'sarana-fashion';

  try {
    // Test 1: count all shops
    const shopCount = await prisma.shop.count();

    // Test 2: list all slugs
    const allSlugs = await prisma.shop.findMany({
      select: { slug: true, storefrontSlug: true, name: true },
      take: 20,
    });

    // Test 3: find specific shop
    const shop = await prisma.shop.findFirst({
      where: { OR: [{ slug }, { storefrontSlug: slug }] },
      select: { id: true, name: true, slug: true, storefrontSlug: true, industry: true, userId: true },
    });

    // Test 4: count products
    const productCount = shop
      ? await prisma.product.count({ where: { userId: shop.userId, isActive: true } })
      : 0;

    // Test 5: DB URL hint (first 30 chars only)
    const dbUrl = process.env.DATABASE_URL?.slice(0, 40) + '...' || 'NOT SET';

    return NextResponse.json({
      dbOk: true,
      dbUrl,
      shopCount,
      allSlugs,
      targetSlug: slug,
      found: !!shop,
      shop,
      productCount,
    });
  } catch (e) {
    return NextResponse.json({
      dbOk: false,
      error: (e as Error).message,
      dbUrl: process.env.DATABASE_URL?.slice(0, 40) + '...' || 'NOT SET',
    });
  }
}
