import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { orderId } = await req.json();

    const escrow = await prisma.escrowTransaction.findUnique({
      where: { orderId },
      include: { order: { include: { entity: true } } },
    });

    if (!escrow) {
      return NextResponse.json({ error: 'Escrow олдсонгүй' }, { status: 404 });
    }
    if (escrow.status !== 'HOLDING') {
      return NextResponse.json({ error: 'Escrow аль хэдийн шилжсэн' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.escrowTransaction.update({
        where: { id: escrow.id },
        data: { status: 'RELEASED', releasedAt: new Date() },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'DELIVERED' },
      });

      const commission = escrow.amount * 0.10;
      const entityAmount = escrow.amount - commission;

      await tx.entity.update({
        where: { id: escrow.order.entityId },
        data: { balance: { increment: entityAmount } },
      });
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Escrow баталгаажуулахад алдаа гарлаа' }, { status: 500 });
  }
}
