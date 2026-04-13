import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminDB as requireAdmin } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const slots = await prisma.bannerSlot.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { bookings: { where: { status: { in: ['approved', 'active'] } } } },
    });
    return NextResponse.json(slots);
  } catch (error) {
    console.error('[banner-slots]:', error);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const body = await req.json();
    const slot = await prisma.bannerSlot.create({
      data: { name: body.name, position: body.position, pricingModel: body.pricingModel || 'flat', priceFlat: body.priceFlat || null, priceCpm: body.priceCpm || null, maxDays: body.maxDays || 30, sortOrder: body.sortOrder || 0 },
    });
    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    console.error('[banner-slots]:', error);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
