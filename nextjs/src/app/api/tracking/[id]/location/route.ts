import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

// POST /api/tracking/[id]/location — Driver GPS update (id = trackingCode or orderId)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { lat, lng } = await req.json();

    if (!lat || !lng) {
      return NextResponse.json({ error: 'lat, lng шаардлагатай' }, { status: 400 });
    }

    // Try by trackingCode first, then by ID
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ trackingCode: id }, { id: /^[a-f\d]{24}$/i.test(id) ? id : undefined }],
        status: 'delivering',
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Хүргэлтийн захиалга олдсонгүй' }, { status: 404 });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { driverLat: lat, driverLng: lng, driverUpdatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Байршил шинэчлэхэд алдаа гарлаа' }, { status: 500 });
  }
}
