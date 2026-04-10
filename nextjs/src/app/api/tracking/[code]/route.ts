import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tracking/[code] — public tracking (no auth)
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const order = await prisma.order.findFirst({
    where: { OR: [{ trackingCode: code }, { id: code }] },
    select: {
      id: true, orderNumber: true, trackingCode: true, status: true, total: true,
      items: true, estimatedDelivery: true, trackingEvents: true,
      driverLat: true, driverLng: true, driverUpdatedAt: true,
      delivery: true, createdAt: true, confirmedAt: true,
    },
  });

  if (!order) return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 });

  return NextResponse.json({
    trackingCode: order.trackingCode,
    orderNumber: order.orderNumber,
    status: order.status,
    total: order.total,
    estimatedAt: order.estimatedDelivery,
    events: order.trackingEvents || [],
    driverLat: order.driverLat,
    driverLng: order.driverLng,
    driverUpdatedAt: order.driverUpdatedAt,
    items: order.items,
    createdAt: order.createdAt,
  });
}
