import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/api-auth';
import { Prisma } from '@prisma/client';

/**
 * POST /api/orders/pos/refund
 * Body: { orderId: string, reason?: string }
 *
 * Refund a completed POS sale. Status → 'refunded', wallet balance
 * decremented by the seller's original payout. No time window.
 */
export async function POST(req: NextRequest) {
  const authUser = requireAuth(req);
  if (authUser instanceof NextResponse) return authUser;

  try {
    const { orderId, reason } = (await req.json()) as {
      orderId?: string;
      reason?: string;
    };
    if (!orderId) return NextResponse.json({ error: 'orderId шаардлагатай' }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 });
    if (order.source !== 'pos') {
      return NextResponse.json({ error: 'Зөвхөн POS захиалга' }, { status: 400 });
    }
    if (order.status !== 'completed') {
      return NextResponse.json({ error: `Refund хийх боломжгүй (${order.status})` }, { status: 400 });
    }
    if (order.refundedAt) {
      return NextResponse.json({ error: 'Аль хэдийн буцаагдсан' }, { status: 400 });
    }

    // Shop ownership check
    const shop = await prisma.shop.findUnique({ where: { userId: authUser.id } });
    if (!shop || order.shopId !== shop.id) {
      return NextResponse.json({ error: 'Энэ захиалга таных биш' }, { status: 403 });
    }

    const refundAmount = order.sellerAmount ?? order.total ?? 0;
    const now = new Date();

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'refunded',
        refundReason: reason ?? 'POS буцаалт',
        refundedAt: now,
        refundedById: authUser.id,
      },
    });

    // Reverse wallet credit
    try {
      await prisma.wallet.update({
        where: { userId: authUser.id },
        data: {
          balance: { decrement: refundAmount },
          history: {
            push: {
              type: 'POS_REFUND',
              amount: -refundAmount,
              orderId,
              description: `POS буцаалт #${orderId.slice(-6).toUpperCase()}`,
              status: 'COMPLETED',
              createdAt: now.toISOString(),
            } as unknown as Prisma.InputJsonValue,
          },
        },
      });
    } catch (e) {
      console.error('POS refund wallet debit failed:', e);
    }

    return NextResponse.json({
      success: true,
      orderId,
      refundAmount,
      status: 'refunded',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Refund алдаа';
    console.error('[POS Refund]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
