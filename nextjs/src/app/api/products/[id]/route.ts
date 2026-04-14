import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products/[id] — product detail for mobile/web
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            shop: { select: { id: true, name: true, slug: true, logo: true } },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Бараа олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      description: product.description,
      images: product.images,
      stock: product.stock,
      category: product.category,
      emoji: product.emoji,
      rating: product.rating,
      reviewCount: product.reviewCount,
      isActive: product.isActive,
      shop: product.user?.shop || null,
      seller: product.user ? { id: product.user.id, name: product.user.name, avatar: product.user.avatar } : null,
    });
  } catch (err) {
    console.error('Product detail error:', err);
    return NextResponse.json({ error: 'Бараа ачаалахад алдаа' }, { status: 500 });
  }
}
