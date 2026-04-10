import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSeller, json, errorJson, getShopForUser } from '@/lib/api-auth';

// GET /api/promotions — list shop's coupons
export async function GET(req: NextRequest) {
  const user = requireSeller(req);
  if (user instanceof Response) return user;

  const shopId = await getShopForUser(user.id);
  const coupons = await prisma.coupon.findMany({
    where: shopId ? { shopId } : {},
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return json(coupons);
}

// POST /api/promotions — create coupon
export async function POST(req: NextRequest) {
  const user = requireSeller(req);
  if (user instanceof Response) return user;

  const shopId = await getShopForUser(user.id);
  const body = await req.json();

  const code = (body.code || `ESL${Math.random().toString(36).slice(2, 8)}`).toUpperCase();

  // Check duplicate
  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) return errorJson('Энэ код аль хэдийн бүртгэлтэй');

  const coupon = await prisma.coupon.create({
    data: {
      code,
      shopId,
      title: body.title || null,
      discountType: body.discountType || 'PERCENT',
      discountValue: body.discountValue || 10,
      minOrderAmount: body.minOrderAmount || null,
      maxDiscount: body.maxDiscount || null,
      usageLimit: body.usageLimit || null,
      promotionType: body.promotionType || null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      startAt: body.startAt ? new Date(body.startAt) : new Date(),
      productIds: body.productIds || [],
    },
  });

  return json(coupon);
}
