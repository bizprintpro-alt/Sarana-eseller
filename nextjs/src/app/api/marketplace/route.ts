export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      take: 40,
      orderBy: { createdAt: 'desc' },
    });

    const items = products.map((p: any) => ({
      id: p.id,
      type: 'product',
      title: p.name,
      price: p.price,
      salePrice: p.salePrice,
      images: p.images,
      category: p.category,
      stock: p.stock,
      createdAt: p.createdAt?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: { items, total: items.length, hasMore: false }
    });
  } catch (e: any) {
    console.error('MARKETPLACE ERROR:', e.message);
    return NextResponse.json({
      success: true,
      data: { items: [], total: 0, hasMore: false }
    });
  }
}
