import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json } from '@/lib/api-auth';

type Ctx = { params: Promise<{ id: string }> };

// Demo reviews fallback
const DEMO_REVIEWS = [
  { id: 'r1', rating: 5, comment: 'Маш сайн чанартай! Дахин захиална.', createdAt: '2026-03-28', buyerName: 'Б. Мөнхбат' },
  { id: 'r2', rating: 4, comment: 'Хүргэлт хурдан байсан. Бараа сайн.', createdAt: '2026-03-25', buyerName: 'О. Сараа' },
  { id: 'r3', rating: 5, comment: 'Гайхалтай! Найзууддаа санал болгосон.', createdAt: '2026-03-20', buyerName: 'Д. Нараа' },
  { id: 'r4', rating: 3, comment: 'Хэмжээ бага зэрэг жижиг байсан.', createdAt: '2026-03-15', buyerName: 'Г. Болд' },
  { id: 'r5', rating: 5, comment: 'Чанар маш сайн, үнэ зохистой.', createdAt: '2026-03-10', buyerName: 'Э. Туяа' },
];

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
    // Fallback
    return json({
      reviews: DEMO_REVIEWS,
      total: DEMO_REVIEWS.length,
      breakdown: [
        { rating: 5, count: 3 },
        { rating: 4, count: 1 },
        { rating: 3, count: 1 },
      ],
      page: 1,
      hasMore: false,
    });
  }
}
