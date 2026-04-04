import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson, requireAuth } from '@/lib/api-auth';

// GET /api/reviews?productId=xxx
export async function GET(req: NextRequest) {
  const productId = new URL(req.url).searchParams.get('productId');
  if (!productId) return NextResponse.json({ error: 'productId шаардлагатай' }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const avg = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return NextResponse.json({ reviews, average: Math.round(avg * 10) / 10, total: reviews.length });
}

// POST /api/reviews — create review
export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const { productId, orderId, rating, comment } = await req.json();

  if (!productId || !orderId || !rating) return errorJson('productId, orderId, rating шаардлагатай');
  if (rating < 1 || rating > 5) return errorJson('rating 1-5 байх ёстой');

  try {
    // Check order belongs to buyer and is delivered
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: auth.id, status: 'delivered' },
    });
    if (!order) return errorJson('Хүргэгдсэн захиалга олдсонгүй');

    // Check not already reviewed
    const existing = await prisma.review.findFirst({
      where: { productId, buyerId: auth.id, orderId },
    });
    if (existing) return errorJson('Аль хэдийн үнэлсэн байна');

    const review = await prisma.review.create({
      data: { productId, buyerId: auth.id, orderId, rating, comment: comment || null },
    });

    // Update product avg rating
    const stats = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.product.update({
      where: { id: productId },
      data: { rating: stats._avg.rating || 0, reviewCount: stats._count },
    });

    return json(review, 201);
  } catch {
    return errorJson('Алдаа гарлаа');
  }
}
