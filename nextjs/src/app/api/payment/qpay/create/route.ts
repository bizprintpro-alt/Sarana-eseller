import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createInvoice } from '@/lib/qpay';
import { ok, fail } from '@/lib/api-envelope';

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, description } = await request.json();

    if (!orderId || !amount) {
      return fail('orderId болон amount шаардлагатай', 400);
    }

    // Create QPay invoice
    const invoice = await createInvoice(
      orderId,
      amount,
      description || 'Захиалгын төлбөр'
    );

    // Save transaction (non-blocking — works even if DB is unavailable)
    prisma.paymentTransaction.create({
      data: {
        orderId,
        method: 'qpay',
        invoiceId: invoice.invoiceId,
        amount,
        status: 'PENDING',
        qrImage: invoice.qrImage,
        qrText: invoice.qrText,
        metadata: { urls: invoice.urls } as any,
      },
    }).catch((e) => console.warn('QPay transaction save failed:', e.message));

    return ok({
      invoiceId: invoice.invoiceId,
      qrImage: invoice.qrImage,
      qrText: invoice.qrText,
      urls: invoice.urls,
    });
  } catch (error: any) {
    console.error('QPay invoice алдаа:', error);
    return fail('Нэхэмжлэл үүсгэхэд алдаа гарлаа', 500);
  }
}
