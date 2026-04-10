import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const overdueEscrows = await prisma.escrowTransaction.findMany({
      where: { status: 'HOLDING', autoReleaseAt: { lte: new Date() } },
      include: { order: { include: { entity: true } } },
    });

    let released = 0;
    for (const escrow of overdueEscrows) {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.escrowTransaction.update({ where: { id: escrow.id }, data: { status: 'RELEASED', releasedAt: new Date() } });
          await tx.order.update({ where: { id: escrow.orderId }, data: { status: 'DELIVERED' } });
          await tx.entity.update({ where: { id: escrow.order.entityId }, data: { balance: { increment: escrow.amount * 0.9 } } });
        });
        released++;
      } catch (e) {
        console.error('Escrow release error:', e);
      }
    }

    return NextResponse.json({ released, total: overdueEscrows.length });
  } catch {
    return NextResponse.json({ error: 'Cron алдаа' }, { status: 500 });
  }
}
