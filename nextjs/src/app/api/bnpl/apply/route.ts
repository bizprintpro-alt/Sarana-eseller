import { NextRequest } from 'next/server';
import { requireAuth, json, errorJson } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { calculateBNPL, BNPL_MONTHS } from '@/lib/bnpl';

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const body = await req.json();
  const { orderId, months, bank } = body as {
    orderId?: string;
    months?: number;
    bank?: string;
  };

  if (!orderId || !months || !bank) {
    return errorJson('orderId, months, bank шаардлагатай');
  }

  if (!(BNPL_MONTHS as readonly number[]).includes(months)) {
    return errorJson('months нь 3, 6, эсвэл 12 байх ёстой');
  }

  const validBanks = ['KHAN', 'GOLOMT', 'TDB', 'HAS'];
  if (!validBanks.includes(bank)) {
    return errorJson('Буруу банк сонгосон');
  }

  // Verify order exists and belongs to user
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return errorJson('Захиалга олдсонгүй', 404);
  if (order.userId !== auth.id) return errorJson('Зөвшөөрөлгүй', 403);
  if (!order.total || order.total <= 0) return errorJson('Захиалгын дүн буруу байна');

  // Check for existing application
  const existing = await prisma.bNPLApplication.findUnique({
    where: { orderId },
  });
  if (existing) return errorJson('Энэ захиалгад BNPL аль хэдийн бүртгэгдсэн');

  const orderTotal = order.total;
  const calc = calculateBNPL(orderTotal, months);

  const application = await prisma.bNPLApplication.create({
    data: {
      userId: auth.id,
      orderId,
      totalAmount: orderTotal,
      downPayment: calc.downPayment,
      monthlyAmount: calc.monthly,
      months,
      bank,
      status: 'PENDING',
    },
  });

  return json(application, 201);
}
