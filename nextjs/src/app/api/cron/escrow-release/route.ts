import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/cron/escrow-release — auto-release expired escrows (daily 09:00)
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const expired = await prisma.escrowTransaction.findMany({
      where: { status: 'HOLDING', autoReleaseAt: { lte: new Date() } },
    });

    let released = 0;
    for (const escrow of expired) {
      // Release escrow
      await prisma.escrowTransaction.update({
        where: { id: escrow.id },
        data: { status: 'RELEASED', releasedAt: new Date() },
      });

      // Update order
      await prisma.order.updateMany({
        where: { id: escrow.orderId },
        data: { escrowStatus: 'RELEASED', confirmedByBuyer: true, confirmedAt: new Date(), status: 'delivered' },
      });

      // Add to seller wallet
      const wallet = await prisma.wallet.findFirst({ where: { userId: escrow.sellerId } });
      if (wallet) {
        const sellerAmount = escrow.amount * 0.98;
        await prisma.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: sellerAmount } } });
      }

      released++;
    }

    return NextResponse.json({ released, total: expired.length });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
