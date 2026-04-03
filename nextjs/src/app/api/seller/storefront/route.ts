import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson, requireSeller, getShopForUser } from '@/lib/api-auth';

// GET /api/seller/storefront — get current config
export async function GET(req: NextRequest) {
  const auth = requireSeller(req);
  if (auth instanceof Response) return auth;

  const shopId = await getShopForUser(auth.id);
  if (!shopId) return errorJson('Дэлгүүр олдсонгүй', 404);

  const storefront = await prisma.sellerStorefront.findUnique({ where: { shopId } });
  return json(storefront);
}

// PATCH /api/seller/storefront — save edited config
export async function PATCH(req: NextRequest) {
  const auth = requireSeller(req);
  if (auth instanceof Response) return auth;

  const shopId = await getShopForUser(auth.id);
  if (!shopId) return errorJson('Дэлгүүр олдсонгүй', 404);

  const body = await req.json();
  const { config, published, subdomain } = body;

  const data: Record<string, unknown> = {};
  if (config !== undefined) data.config = config;
  if (published !== undefined) {
    data.published = published;
    if (published) data.publishedAt = new Date();
  }
  if (subdomain !== undefined) data.subdomain = subdomain;

  const result = await prisma.sellerStorefront.upsert({
    where: { shopId },
    update: data,
    create: { shopId, config: config || {}, ...data },
  });

  return json(result);
}
