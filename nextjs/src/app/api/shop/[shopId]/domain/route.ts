import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson, requireSeller } from '@/lib/api-auth';

type Ctx = { params: Promise<{ shopId: string }> };

// GET /api/shop/[shopId]/domain
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { shopId } = await ctx.params;

  const domain = await prisma.shopDomain.findUnique({ where: { shopId } });
  return json(domain);
}

// POST /api/shop/[shopId]/domain — set or update custom domain
export async function POST(req: NextRequest, ctx: Ctx) {
  const auth = requireSeller(req);
  if (auth instanceof Response) return auth;

  const { shopId } = await ctx.params;

  const shop = await prisma.shop.findFirst({ where: { id: shopId, userId: auth.id } });
  if (!shop) return errorJson('Дэлгүүр олдсонгүй эсвэл эрх хүрэхгүй', 403);

  const body = await req.json();
  const { domain } = body as { domain: string };

  if (!domain || domain.length < 3) return errorJson('Домайн нэр шаардлагатай (3+ тэмдэгт)');

  // Check uniqueness
  const existing = await prisma.shopDomain.findUnique({ where: { domain } });
  if (existing && existing.shopId !== shopId) {
    return errorJson('Энэ домайн аль хэдийн бүртгэгдсэн');
  }

  const result = await prisma.shopDomain.upsert({
    where: { shopId },
    update: { domain, verified: false },
    create: { shopId, domain, verified: false },
  });

  return json(result);
}
