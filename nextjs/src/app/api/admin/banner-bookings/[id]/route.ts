import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminDB as requireAdmin } from '@/lib/api-auth';
import { recordRevenue } from '@/lib/revenue';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const { id } = await ctx.params;
    const body = await req.json();
    const booking = await prisma.bannerBooking.update({ where: { id }, data: { status: body.status } });
    if (body.status === 'approved' || body.status === 'active') {
      await recordRevenue('banner', booking.totalPrice, { bookingId: id, slotId: booking.slotId });
    }
    return NextResponse.json(booking);
  } catch (error) {
    console.error('[banner-bookings/id]:', error);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
