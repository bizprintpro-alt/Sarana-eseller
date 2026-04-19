import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPayment } from '@/lib/qpay';
import { ok, fail } from '@/lib/api-envelope';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { invoiceId } = await params;

    if (!invoiceId) {
      return fail('invoiceId шаардлагатай', 400);
    }

    const status = await checkPayment(invoiceId);

    if (status.paid) {
      await prisma.paymentTransaction.update({
        where: { invoiceId },
        data: {
          status: 'PAID',
          paidAt: status.paidDate ? new Date(status.paidDate) : new Date(),
        },
      }).catch((e) => console.warn('QPay transaction update failed:', e.message));
    }

    return ok(status);
  } catch (error: any) {
    console.error('QPay check алдаа:', error);
    return fail('Төлбөр шалгахад алдаа гарлаа', 500);
  }
}
