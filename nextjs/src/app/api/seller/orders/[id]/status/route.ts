import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSeller, errorJson } from '@/lib/api-auth';
import { calculateOrderCommission } from '@/lib/commission';
import { recordRevenue } from '@/lib/revenue';

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/seller/orders/[id]/status — update order status
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = requireSeller(req);
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;
  const body = await req.json();
  const { status, note } = body;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return errorJson('Захиалга олдсонгүй', 404);

  // Update order
  await prisma.order.update({
    where: { id },
    data: { status },
  });

  // Log event
  await prisma.orderEvent.create({
    data: { orderId: id, status, note: note || null, updatedBy: user.id },
  });

  // On delivery completion, calculate commission
  if (status === 'delivered' && order.total && order.shopId) {
    const hasAffiliate = !!order.referralCode;
    const comm = await calculateOrderCommission(order.shopId, order.total, hasAffiliate);

    await prisma.order.update({
      where: { id },
      data: {
        platformAmount: comm.platformAmount,
        sellerAmount: comm.sellerAmount,
        affiliateAmount: comm.affiliateAmount,
      },
    });

    await recordRevenue('commission', comm.platformAmount, { orderId: id, shopId: order.shopId });
  }

  return NextResponse.json({ success: true, status });
}
