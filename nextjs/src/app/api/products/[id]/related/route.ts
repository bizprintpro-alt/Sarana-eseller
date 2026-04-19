import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products/[id]/related?limit=4
// Same-category active products, excluding the current one.
// Used by the web ProductDetailClient and the mobile product detail
// "Төстэй бараа" section. Shape matches the /api/products list so a
// single ProductCard component can render either feed.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const limit = Math.min(12, Math.max(1, Number(req.nextUrl.searchParams.get('limit') || '4')));

  try {
    const current = await prisma.product.findUnique({
      where: { id },
      select: { category: true },
    });

    if (!current || !current.category) {
      return NextResponse.json({ products: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        category: current.category,
        id: { not: id },
        isActive: true,
        isDemo: false,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        price: true,
        salePrice: true,
        images: true,
        emoji: true,
        rating: true,
        reviewCount: true,
      },
    });

    return NextResponse.json({ products });
  } catch (err) {
    console.error('Related products error:', err);
    return NextResponse.json({ products: [] });
  }
}
