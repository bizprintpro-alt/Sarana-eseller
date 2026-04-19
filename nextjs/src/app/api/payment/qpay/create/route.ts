import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createInvoice } from '@/lib/qpay';
import { getAuthUser } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 });
    }

    const { orderId, description } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId шаардлагатай' },
        { status: 400 }
      );
    }

    // Always derive amount server-side from the order — never trust client input
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 });
    }
    if (order.userId !== user.id) {
      return NextResponse.json(
        { error: 'Зөвхөн эзэмшигч төлбөр үүсгэх боломжтой' },
        { status: 403 },
      );
    }

    const amount = order.total;
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Захиалгын дүн буруу байна' }, { status: 400 });
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
