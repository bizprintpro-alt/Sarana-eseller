import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson, requireSeller, getShopForUser } from '@/lib/api-auth';

type Ctx = { params: Promise<{ id: string }> };

const VALID_STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled', 'no_show'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  no_show: [],
};

// PUT /api/bookings/[id]/status — update booking status (seller only)
export async function PUT(req: NextRequest, ctx: Ctx) {
  const auth = requireSeller(req);
  if (auth instanceof Response) return auth;

  const { id } = await ctx.params;
  const shopId = await getShopForUser(auth.id);
  if (!shopId) return errorJson('Дэлгүүр олдсонгүй', 404);

  const body = await req.json();
  const { status } = body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return errorJson(`Зөвшөөрөгдөх төлөв: ${VALID_STATUSES.join(', ')}`);
  }

  const booking = await prisma.booking.findFirst({ where: { id, shopId } });
  if (!booking) return errorJson('Захиалга олдсонгүй', 404);

  // Validate state transition
  const allowed = VALID_TRANSITIONS[booking.status] || [];
  if (!allowed.includes(status)) {
    return errorJson(`"${booking.status}" төлөвөөс "${status}" руу шилжих боломжгүй`);
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status },
    include: { service: { select: { name: true } } },
  });

  return json(updated);
}
