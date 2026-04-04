import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPayment } from '@/lib/qpay';

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'invoiceId шаардлагатай' },
        { status: 400 }
      );
    }

    const status = await checkPayment(invoiceId);

    // Update transaction if paid
    if (status.paid) {
      await prisma.paymentTransaction.update({
        where: { invoiceId },
        data: {
          status: 'PAID',
          paidAt: status.paidDate ? new Date(status.paidDate) : new Date(),
        },
      });
    }

    return NextResponse.json(status);
  } catch (error: any) {
    console.error('QPay check алдаа:', error);
    return NextResponse.json(
      { error: 'Төлбөр шалгахад алдаа гарлаа' },
      { status: 500 }
    );
  }
}
