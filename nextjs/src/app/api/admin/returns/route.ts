import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminDB as requireAdmin, json, errorJson } from '@/lib/api-auth';

// GET /api/admin/returns — list all return requests
export async function GET(req: NextRequest) {
  const user = await requireAdmin(req);
  if (user instanceof NextResponse) return user;

  const status = req.nextUrl.searchParams.get('status');
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const limit = 20;

  const where = status ? { status } : {};

  const [returns, total] = await Promise.all([
    prisma.returnRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.returnRequest.count({ where }),
  ]);

  // Enrich with order and buyer info
  const enriched = await Promise.all(
    returns.map(async (r) => {
      const [order, buyer] = await Promise.all([
        prisma.order.findUnique({
          where: { id: r.orderId },
          select: { id: true, orderNumber: true, total: true, status: true, shopId: true },
        }),
        prisma.user.findUnique({
          where: { id: r.buyerId },
          select: { id: true, name: true, email: true, phone: true },
        }),
      ]);
      return { ...r, order, buyer };
    })
  );

  return json({ returns: enriched, total, page, pages: Math.ceil(total / limit) });
}
