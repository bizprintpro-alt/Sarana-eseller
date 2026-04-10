import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

// PATCH /api/tracking/[code]/location — driver GPS update
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const user = requireAuth(req);
  if (user instanceof Response) return user;
  const { code } = await params;

  const { lat, lng } = await req.json();
  if (!lat || !lng) return NextResponse.json({ error: 'lat, lng шаардлагатай' }, { status: 400 });

  await prisma.order.updateMany({
    where: { OR: [{ trackingCode: code }, { id: code }] },
    data: { driverLat: lat, driverLng: lng, driverUpdatedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
