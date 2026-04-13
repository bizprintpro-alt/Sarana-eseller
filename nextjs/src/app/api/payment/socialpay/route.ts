import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, errorJson, json } from '@/lib/api-auth';
import { createSocialPayInvoice } from '@/lib/payments/socialpay';

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return errorJson('Нэвтрэх шаардлагатай', 401);

  const { orderId } = await req.json();
  if (!orderId) return errorJson('orderId шаардлагатай', 400);

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return errorJson('Захиалга олдсонгүй', 404);
  if (order.userId !== user.id) return errorJson('Эрх байхгүй', 403);

  const amount = order.total || 0;
  if (amount <= 0) return errorJson('Төлбөрийн дүн буруу', 400);

  try {
    const result = await createSocialPayInvoice({
      amount,
      orderId: order.id,
      description: `eseller.mn захиалга ${order.orderNumber || order.id.slice(-6)}`,
    });

    // Record payment transaction
    await prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        method: 'socialpay',
        amount,
        status: 'PENDING',
        invoiceId: result.invoice_id || result.invoiceId || orderId,
        metadata: result,
      },
    });

    return json({
      invoiceUrl: result.invoice_url || result.invoiceUrl,
      invoiceId: result.invoice_id || result.invoiceId,
    });
  } catch (err) {
    console.error('[SocialPay] Create error:', err);
    return errorJson('SocialPay нэхэмжлэх үүсгэж чадсангүй', 500);
  }
}
