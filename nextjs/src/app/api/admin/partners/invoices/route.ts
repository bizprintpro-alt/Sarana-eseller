import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, json } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const user = requireAdmin(req);
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
