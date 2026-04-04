export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      take: 60,
      orderBy: { createdAt: 'desc' },
    });

    // Map to store page format (_id, name, price, etc)
    const items = products.map((p) => ({
      _id: p.id,
      id: p.id,
      type: 'product',
      name: p.name,
      title: p.name,
      price: p.price,
      salePrice: p.salePrice,
      description: p.description,
      category: p.category,
      emoji: p.emoji,
      images: p.images || [],
      stock: p.stock,
      rating: p.rating,
      reviewCount: p.reviewCount,
      isActive: p.isActive,
      createdAt: p.createdAt?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: { items, total: items.length, hasMore: false },
      // Also return as "products" for store page compatibility
      products: items,
    });
  } catch (e: unknown) {
    console.error('MARKETPLACE ERROR:', (e as Error).message);
    return NextResponse.json({
      success: true,
      data: { items: [], total: 0, hasMore: false },
      products: [],
    });
  }
}
