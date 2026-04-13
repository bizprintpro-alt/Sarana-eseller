import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, json, errorJson, getShopForUser } from '@/lib/api-auth';

// GET /api/enterprise/my — get current user's enterprise setup
export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  const shopId = await getShopForUser(user.id);
  if (!shopId) return json(null);

  const enterprise = await prisma.enterpriseShop.findUnique({
    where: { shopId },
    include: { shop: { select: { name: true, slug: true } } },
  });

  return json(enterprise);
}
