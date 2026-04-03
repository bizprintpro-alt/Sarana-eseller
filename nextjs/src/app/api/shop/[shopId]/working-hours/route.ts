import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson, requireSeller } from '@/lib/api-auth';

type Ctx = { params: Promise<{ shopId: string }> };

// GET /api/shop/[shopId]/working-hours
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { shopId } = await ctx.params;

  const hours = await prisma.workingHours.findMany({
    where: { shopId },
    orderBy: { dayOfWeek: 'asc' },
  });

  // Return defaults if none exist
  if (hours.length === 0) {
    const defaults = Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      openTime: i === 0 ? '00:00' : '09:00',
      closeTime: i === 0 ? '00:00' : '18:00',
      isClosed: i === 0,
    }));
    return json(defaults);
  }

  return json(hours);
}

// PUT /api/shop/[shopId]/working-hours — bulk update (seller only)
export async function PUT(req: NextRequest, ctx: Ctx) {
  const auth = requireSeller(req);
  if (auth instanceof Response) return auth;

  const { shopId } = await ctx.params;

  // Verify shop ownership
  const shop = await prisma.shop.findFirst({ where: { id: shopId, userId: auth.id } });
  if (!shop) return errorJson('Дэлгүүр олдсонгүй эсвэл эрх хүрэхгүй', 403);

  const body = await req.json();
  const { hours } = body as { hours: { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }[] };

  if (!Array.isArray(hours) || hours.length !== 7) {
    return errorJson('7 өдрийн цагийн мэдээлэл шаардлагатай');
  }

  // Delete existing and recreate
  await prisma.workingHours.deleteMany({ where: { shopId } });

  const created = await prisma.workingHours.createMany({
    data: hours.map((h) => ({
      shopId,
      dayOfWeek: h.dayOfWeek,
      openTime: h.openTime,
      closeTime: h.closeTime,
      isClosed: h.isClosed,
    })),
  });

  const updated = await prisma.workingHours.findMany({
    where: { shopId },
    orderBy: { dayOfWeek: 'asc' },
  });

  return json(updated);
}
