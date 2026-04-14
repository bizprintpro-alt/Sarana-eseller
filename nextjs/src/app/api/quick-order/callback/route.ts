import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/quick-order/callback — QPay webhook
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const invoiceId = body.invoice_id || body.invoiceId || body.body?.invoiceId;

    if (!invoiceId) return NextResponse.json({ ok: true });

    const quickOrder = await prisma.quickOrder.findFirst({
      where: { invoiceId },
      include: { product: true, user: { select: { id: true, name: true } } },
    });

    if (!quickOrder || quickOrder.status === 'PAID') {
      return NextResponse.json({ ok: true });
    }

    // Mark as paid
    await prisma.quickOrder.update({
      where: { id: quickOrder.id },
      data: { status: 'PAID' },
    });

    // Decrement stock
    if (quickOrder.product.stock !== null && quickOrder.product.stock !== undefined) {
      await prisma.product.update({
        where: { id: quickOrder.productId },
        data: { stock: { decrement: quickOrder.quantity } },
      });
    }

    // Create real Order
    const amount = (quickOrder.product.salePrice || quickOrder.product.price) * quickOrder.quantity;
    await prisma.order.create({
      data: {
        userId: quickOrder.userId,
        items: [{
          productId: quickOrder.productId,
          name: quickOrder.product.name,
          price: quickOrder.product.salePrice || quickOrder.product.price,
          quantity: quickOrder.quantity,
        }],
        total: amount,
        status: 'confirmed',
        paymentMethod: 'qpay',
        paymentId: invoiceId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[quick-order callback]', err);
    return NextResponse.json({ ok: true });
  }
}
