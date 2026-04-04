import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

// GET /api/admin/banner-bookings?status=pending
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const status = new URL(req.url).searchParams.get('status');
  const where = status ? { status } : {};
  const bookings = await prisma.bannerBooking.findMany({
    where,
    include: { slot: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(bookings);
}
