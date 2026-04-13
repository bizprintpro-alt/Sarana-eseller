import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoice, status, amount } = body;

    if (!invoice) {
      return NextResponse.json({ error: 'Missing invoice' }, { status: 400 });
    }

    // Find the payment transaction
    const payment = await prisma.paymentTransaction.findFirst({
      where: {
        OR: [
          { invoiceId: invoice },
          { orderId: invoice },
        ],
      },
    });

    if (!payment) {
      console.warn('[SocialPay Callback] Payment not found:', invoice);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const isPaid = status === 'PAID' || status === 'SUCCESS' || status === 'paid';

    // Update payment status
    await prisma.paymentTransaction.update({
      where: { id: payment.id },
      data: {
        status: isPaid ? 'PAID' : 'FAILED',
        paidAt: isPaid ? new Date() : undefined,
        metadata: body,
      },
    });

    // If paid, update order status
    if (isPaid && payment.orderId) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: 'confirmed',
          paymentMethod: 'socialpay',
          paymentId: invoice,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[SocialPay Callback] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
