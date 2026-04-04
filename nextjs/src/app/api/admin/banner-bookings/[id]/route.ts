import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { recordRevenue } from '@/lib/revenue';

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/banner-bookings/[id] — approve/reject
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { id } = await ctx.params;
  const body = await req.json();
  const booking = await prisma.bannerBooking.update({
    where: { id },
    data: { status: body.status },
  });

  // Record revenue on approval
  if (body.status === 'approved' || body.status === 'active') {
    await recordRevenue('banner', booking.totalPrice, { bookingId: id, slotId: booking.slotId });
  }

  return NextResponse.json(booking);
}
