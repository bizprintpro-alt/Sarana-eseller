import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, json, errorJson } from '@/lib/api-auth';
import { sendExpoPush } from '@/lib/push';

// POST /api/driver/orders/[id]/accept
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, status: 'ready', driverId: null },
  });
  if (!order) return errorJson('Захиалга авах боломжгүй', 400);

  const updated = await prisma.order.update({
    where: { id },
    data: { driverId: user.id, status: 'delivering' },
  });

  // Push buyer
  const buyer = await prisma.user.findUnique({
    where: { id: order.userId },
    select: { pushToken: true },
  });
  if (buyer?.pushToken) {
    await sendExpoPush(buyer.pushToken, {
      title: 'Жолооч таны захиалгыг авлаа',
      body: '2-4 цагийн дотор хүргэнэ',
      data: { orderId: id },
    });
  }

  return json({ order: updated });
}
