import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson, requireSeller } from '@/lib/api-auth';

type Ctx = { params: Promise<{ shopId: string }> };

const VALID_TYPES = ['product', 'service', 'hybrid'];

// GET /api/shop/[shopId]/type
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { shopId } = await ctx.params;

  const shopType = await prisma.shopType.findUnique({ where: { shopId } });
  return json(shopType || { shopId, type: 'product' });
}

// PUT /api/shop/[shopId]/type — set shop type
export async function PUT(req: NextRequest, ctx: Ctx) {
  const auth = requireSeller(req);
  if (auth instanceof Response) return auth;

  const { shopId } = await ctx.params;

  const shop = await prisma.shop.findFirst({ where: { id: shopId, userId: auth.id } });
  if (!shop) return errorJson('Дэлгүүр олдсонгүй эсвэл эрх хүрэхгүй', 403);

  const body = await req.json();
  const { type } = body as { type: string };

  if (!type || !VALID_TYPES.includes(type)) {
    return errorJson(`Зөвшөөрөгдөх төрөл: ${VALID_TYPES.join(', ')}`);
  }

  const result = await prisma.shopType.upsert({
    where: { shopId },
    update: { type },
    create: { shopId, type },
  });

  return json(result);
}
