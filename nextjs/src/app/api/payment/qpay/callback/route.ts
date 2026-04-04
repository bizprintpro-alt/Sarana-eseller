import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { object_id, object_type, payment_id } = body;

    if (!object_id) {
      return NextResponse.json({ error: 'Invalid callback' }, { status: 400 });
    }

    // Find and update transaction
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { invoiceId: object_id },
    });

    if (!transaction) {
      console.error('QPay callback: transaction not found', object_id);
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.paymentTransaction.update({
      where: { invoiceId: object_id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        metadata: {
          ...(transaction.metadata as any || {}),
          qpayPaymentId: payment_id,
          callbackReceived: new Date().toISOString(),
        },
      },
    });

    // Update order status
    try {
      await prisma.order.update({
        where: { id: transaction.orderId },
        data: { status: 'PAID' } as any,
      });
    } catch {
      // Order update is best-effort
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('QPay callback алдаа:', error);
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
  }
}
