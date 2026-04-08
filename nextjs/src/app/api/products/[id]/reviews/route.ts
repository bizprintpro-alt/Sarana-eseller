import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json } from '@/lib/api-auth';

type Ctx = { params: Promise<{ id: string }> };

// GET /api/products/[id]/reviews?page=1&limit=10
export async function GET(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') || '1'));
  const limit = Math.min(20, Number(req.nextUrl.searchParams.get('limit') || '10'));

  try {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId: id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: { productId: id } }),
    ]);

    // Rating breakdown
    const breakdown = await prisma.review.groupBy({
      by: ['rating'],
      where: { productId: id },
      _count: true,
    });

    return json({
      reviews,
      total,
      breakdown: breakdown.map((b) => ({ rating: b.rating, count: b._count })),
      page,
      hasMore: page * limit < total,
    });
  } catch {
    return json({
      reviews: [],
      total: 0,
      breakdown: [],
      page: 1,
      hasMore: false,
    });
  }
}
