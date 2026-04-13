import { NextRequest } from 'next/server';
import { requireAuth, json } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const applications = await prisma.bNPLApplication.findMany({
    where: { userId: auth.id },
    include: {
      payments: { orderBy: { dueDate: 'asc' } },
      order: { select: { id: true, orderNumber: true, total: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Enrich each application with next payment info
  const enriched = applications.map((app) => {
    const nextPayment = app.payments.find((p) => p.status === 'PENDING');
    const paidCount = app.payments.filter((p) => p.status === 'PAID').length;
    return {
      ...app,
      nextPayment: nextPayment || null,
      progress: { paid: paidCount, total: app.months },
    };
  });

  return json(enriched);
}
