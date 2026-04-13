import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminDB as requireAdmin, json } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const user = await requireAdmin(req);
  if (user instanceof Response) return user;

  try {
    const invoices = await prisma.partnerInvoice.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return json(invoices);
  } catch (e) {
    return json([]);
  }
}
