import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson, requireAuth } from '@/lib/api-auth';

type Ctx = { params: Promise<{ id: string }> };

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivering', 'cancelled'],
  delivering: ['delivered'],
  delivered: [],
  cancelled: [],
};

// Which role transitions each status
const BUYER_TRANSITIONS = new Set(['cancelled']);
const SELLER_TRANSITIONS = new Set(['confirmed', 'preparing', 'ready', 'cancelled']);
const DRIVER_TRANSITIONS = new Set(['delivering', 'delivered']);
const ADMIN_ROLES = new Set(['admin', 'superadmin', 'super_admin']);

// PATCH /api/orders/[id]/status
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await ctx.params;
  const { status, note, estimatedMinutes } = await req.json();

  if (!status) return errorJson('status шаардлагатай');

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return errorJson('Захиалга олдсонгүй', 404);

    const allowed = VALID_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      return errorJson(`"${order.status}" → "${status}" шилжих боломжгүй`);
    }

    // Role/ownership check — admins bypass
    if (!ADMIN_ROLES.has(auth.role)) {
      const isBuyer = order.userId === auth.id;
      const isDriver = order.driverId === auth.id;
      let isSeller = false;
      if (order.shopId) {
        const shop = await prisma.shop.findUnique({ where: { id: order.shopId }, select: { userId: true } });
        isSeller = shop?.userId === auth.id;
      }

      const allowedByRole =
        (isBuyer && BUYER_TRANSITIONS.has(status)) ||
        (isSeller && SELLER_TRANSITIONS.has(status)) ||
        (isDriver && DRIVER_TRANSITIONS.has(status));

      if (!allowedByRole) {
        return errorJson('Энэ захиалгын төлвийг өөрчлөх эрхгүй', 403);
      }
    }

    const historyEntry = { status, timestamp: new Date().toISOString(), note: note || undefined, by: auth.id };
    const currentHistory = (order.statusHistory as any[]) || [];

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status,
        statusHistory: [...currentHistory, historyEntry],
        ...(estimatedMinutes !== undefined && { estimatedMinutes }),
      },
    });

    return json(updated);
  } catch {
    return errorJson('Алдаа гарлаа');
  }
}

// GET /api/orders/[id]/status — public order tracking
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true, orderNumber: true, status: true, statusHistory: true, estimatedMinutes: true, total: true, createdAt: true, items: true },
    });
    if (!order) return errorJson('Захиалга олдсонгүй', 404);
    return json(order);
  } catch {
    return errorJson('Алдаа');
  }
}
