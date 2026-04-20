import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson, requireSeller, getShopForUser } from '@/lib/api-auth';

// GET /api/services?shopId=...
export async function GET(req: NextRequest) {
  try {
    const shopId = req.nextUrl.searchParams.get('shopId');

    const where = shopId && shopId !== 'all'
      ? { shopId, isActive: true }
      : { isActive: true };

    const services = await prisma.service.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return json(services);
  } catch (error) {
    console.error('Services fetch error:', error);
    return json([]);
  }
}

// POST /api/services — create service (auth required, seller only)
export async function POST(req: NextRequest) {
  const auth = requireSeller(req);
  if (auth instanceof Response) return auth;

  const shopId = await getShopForUser(auth.id);
  if (!shopId) return errorJson('Дэлгүүр олдсонгүй', 404);

  const body = await req.json();
  const { name, description, price, duration, category, images, isActive } = body;

  if (!name || !price) return errorJson('Нэр болон үнэ шаардлагатай');

  const service = await prisma.service.create({
    data: {
      shopId,
      name,
      description: description || null,
      price: Number(price),
      duration: duration ? Number(duration) : null,
      category: category || null,
      images: images || [],
      isActive: isActive !== false,
    },
  });

  return json(service, 201);
}
