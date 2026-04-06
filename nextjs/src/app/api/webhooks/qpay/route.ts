import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPayment } from '@/lib/payment/qpay';

/**
 * QPay Webhook callback
 * Called by QPay when payment is completed
 */
export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get('orderId');
    if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (order.status !== 'pending') {
      return NextResponse.json({ status: 'already_processed' });
    }

    // Verify payment with QPay
    if (order.paymentId) {
      const result = await checkPayment(order.paymentId);
      if (result.count > 0 && result.paid_amount >= (order.total || 0)) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'confirmed' },
        });
        return NextResponse.json({ status: 'confirmed' });
      }
    }

    return NextResponse.json({ status: 'not_paid' });
  } catch (error) {
    console.error('QPay webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// QPay may also POST
export async function POST(req: NextRequest) {
  return GET(req);
}
