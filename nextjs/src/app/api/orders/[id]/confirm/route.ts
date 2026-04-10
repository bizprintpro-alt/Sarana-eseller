import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, json, errorJson } from '@/lib/api-auth';

// POST /api/orders/[id]/confirm — buyer confirms receipt
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = requireAuth(req);
  if (user instanceof Response) return user;
  const { id } = await params;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return errorJson('Захиалга олдсонгүй', 404);
  if (order.userId !== user.id) return errorJson('Зөвшөөрөлгүй', 403);
  if (order.confirmedByBuyer) return json({ message: 'Аль хэдийн баталгаажсан' });

  // Update order
  await prisma.order.update({
    where: { id },
    data: { confirmedByBuyer: true, confirmedAt: new Date(), status: 'delivered', escrowStatus: 'RELEASED' },
  });

  // Release escrow
  const escrow = await prisma.escrowTransaction.findUnique({ where: { orderId: id } });
  if (escrow) {
    await prisma.escrowTransaction.update({
      where: { id: escrow.id },
      data: { status: 'RELEASED', releasedAt: new Date() },
    });

    // Add to seller wallet
    const wallet = await prisma.wallet.findFirst({ where: { userId: escrow.sellerId } });
    if (wallet) {
      const sellerAmount = escrow.amount * 0.98; // 2% platform fee
      await prisma.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: sellerAmount } } });
    }
  }

  return json({ message: 'Бараа хүлээн авсанаа баталгаажууллаа!' });
}
