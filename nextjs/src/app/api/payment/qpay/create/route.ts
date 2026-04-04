import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createInvoice } from '@/lib/qpay';

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, description } = await request.json();

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'orderId болон amount шаардлагатай' },
        { status: 400 }
      );
    }

    // Create QPay invoice
    const invoice = await createInvoice(
      orderId,
      amount,
      description || 'Захиалгын төлбөр'
    );

    // Save transaction
    await prisma.paymentTransaction.create({
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
    });

    return NextResponse.json({
      invoiceId: invoice.invoiceId,
      qrImage: invoice.qrImage,
      qrText: invoice.qrText,
      urls: invoice.urls,
    });
  } catch (error: any) {
    console.error('QPay invoice алдаа:', error);
    return NextResponse.json(
      { error: 'Нэхэмжлэл үүсгэхэд алдаа гарлаа' },
      { status: 500 }
    );
  }
}
