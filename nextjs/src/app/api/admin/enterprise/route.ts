import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminDB as requireAdmin, json, errorJson } from '@/lib/api-auth';

// GET /api/admin/enterprise — list all enterprise shops
export async function GET(req: NextRequest) {
  const user = await requireAdmin(req);
  if (user instanceof NextResponse) return user;

  const shops = await prisma.enterpriseShop.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      shop: { select: { id: true, name: true, slug: true, logo: true } },
    },
  });

  return json({ shops });
}

// PATCH /api/admin/enterprise — update enterprise shop
export async function PATCH(req: NextRequest) {
  const user = await requireAdmin(req);
  if (user instanceof NextResponse) return user;

  const { id, isActive, plan, customDomain } = await req.json();
  if (!id) return errorJson('id шаардлагатай');

  const data: Record<string, unknown> = {};
  if (typeof isActive === 'boolean') data.isActive = isActive;
  if (plan) data.plan = plan;
  if (typeof customDomain === 'string') data.customDomain = customDomain || null;

  const updated = await prisma.enterpriseShop.update({
    where: { id },
    data,
  });

  return json(updated);
}
