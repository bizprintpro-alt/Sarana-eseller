import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminDB as requireAdmin, json, errorJson } from '@/lib/api-auth';
import { sendEmail, buildEmailTemplate } from '@/lib/marketing/EmailService';
import { sendSMS } from '@/lib/marketing/SMSService';

// PUT /api/admin/returns/[id] — approve or reject return
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin(req);
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const { status, adminNote } = await req.json();

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return errorJson('status: APPROVED | REJECTED');
  }

  const ret = await prisma.returnRequest.findUnique({ where: { id } });
  if (!ret) return errorJson('Буцаалт олдсонгүй', 404);
  if (ret.status !== 'PENDING') return errorJson('Аль хэдийн шийдвэрлэгдсэн');

  // Update return request
  await prisma.returnRequest.update({
    where: { id },
    data: { status, adminNote, resolvedAt: new Date() },
  });

  const order = await prisma.order.findUnique({ where: { id: ret.orderId } });
  const buyer = await prisma.user.findUnique({ where: { id: ret.buyerId } });

  if (status === 'APPROVED' && order) {
    // Refund via escrow → buyer wallet
    const escrow = await prisma.escrowTransaction.findUnique({ where: { orderId: ret.orderId } });
    if (escrow) {
      await prisma.escrowTransaction.update({
        where: { id: escrow.id },
        data: { status: 'REFUNDED', releasedAt: new Date() },
      });

      // Add to buyer wallet
      const wallet = await prisma.wallet.findFirst({ where: { userId: ret.buyerId } });
      if (wallet) {
        await prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: escrow.amount } },
        });
      } else {
        await prisma.wallet.create({
          data: { userId: ret.buyerId, balance: escrow.amount },
        });
      }
    }

    await prisma.order.update({
      where: { id: ret.orderId },
      data: { escrowStatus: 'REFUNDED', status: 'cancelled' },
    });

    // Notify buyer
    if (buyer?.email) {
      await sendEmail(
        buyer.email,
        'Буцаалт зөвшөөрөгдлөө',
        buildEmailTemplate(
          'Буцаалт зөвшөөрөгдлөө',
          `<p>Таны захиалга ${order.orderNumber || order.id.slice(-6)}-н буцаалт зөвшөөрөгдөж, мөнгө таны wallet-д буцаагдлаа.</p>`,
          'https://eseller.mn/dashboard/orders',
          'Захиалга харах'
        ),
      );
    }
    if (buyer?.phone) {
      await sendSMS(buyer.phone, `eseller.mn: Буцаалт зөвшөөрөгдлөө. Мөнгө wallet-д буцаагдлаа.`);
    }
  } else if (status === 'REJECTED' && order) {
    // Release escrow to seller
    const escrow = await prisma.escrowTransaction.findUnique({ where: { orderId: ret.orderId } });
    if (escrow) {
      await prisma.escrowTransaction.update({
        where: { id: escrow.id },
        data: { status: 'RELEASED', releasedAt: new Date() },
      });

      const wallet = await prisma.wallet.findFirst({ where: { userId: escrow.sellerId } });
      if (wallet) {
        const sellerAmount = escrow.amount * 0.98;
        await prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: sellerAmount } },
        });
      }
    }

    await prisma.order.update({
      where: { id: ret.orderId },
      data: { escrowStatus: 'RELEASED' },
    });

    if (buyer?.email) {
      await sendEmail(
        buyer.email,
        'Буцаалт татгалзагдлаа',
        buildEmailTemplate(
          'Буцаалт татгалзагдлаа',
          `<p>Таны захиалга ${order.orderNumber || order.id.slice(-6)}-н буцаалтыг татгалзлаа.</p>${adminNote ? `<p>Шалтгаан: ${adminNote}</p>` : ''}`,
          'https://eseller.mn/dashboard/orders',
          'Захиалга харах'
        ),
      );
    }
  }

  return json({ message: status === 'APPROVED' ? 'Буцаалт зөвшөөрөгдлөө' : 'Буцаалт татгалзагдлаа' });
}
