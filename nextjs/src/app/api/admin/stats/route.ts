import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminDB as requireAdmin } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Wide Promise.all — 5 per-role counts replaced by 1 groupBy; all independent
    // findMany/aggregate calls execute in one wave instead of 4 sequential waves.
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const [
      totalUsers,
      totalShops,
      totalProducts,
      totalOrders,
      totalCategories,
      pendingDisputes,
      activeChats,
      roleGroups,
      todayRevenues,
      walletAgg,
      recentOrders,
      allRevenues,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.shop.count({ where: { isDemo: false } }),
      prisma.product.count({ where: { isDemo: false, isActive: true } }),
      prisma.order.count(),
      prisma.category.count(),
      prisma.dispute.count({ where: { status: 'open' } }).catch(() => 0),
      prisma.conversation.count().catch(() => 0),
      prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      prisma.platformRevenue.findMany({ where: { date: { gte: today } } }).catch(() => [] as { amount: number }[]),
      prisma.wallet.aggregate({ where: { balance: { gt: 0 } }, _sum: { balance: true } }).catch(() => ({ _sum: { balance: 0 } })),
      prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, total: true },
        orderBy: { createdAt: 'asc' },
      }).catch(() => [] as { createdAt: Date; total: number | null }[]),
      prisma.platformRevenue.findMany({ where: { date: { gte: thirtyDaysAgo } } }).catch(() => [] as { source: string; amount: number }[]),
    ]);

    const roleCount = (r: string) => roleGroups.find((g) => g.role === r)?._count._all ?? 0;
    const buyerCount = roleCount('buyer');
    const sellerCount = roleCount('seller');
    const affiliateCount = roleCount('affiliate');
    const deliveryCount = roleCount('delivery');
    const adminCount = roleCount('admin');

    const todayRevenue = todayRevenues.reduce((s, r) => s + r.amount, 0);
    const pendingPayout = walletAgg._sum.balance ?? 0;

    const ordersByDay: Record<string, { count: number; revenue: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      ordersByDay[d.toISOString().slice(0, 10)] = { count: 0, revenue: 0 };
    }
    for (const o of recentOrders) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      if (ordersByDay[key]) {
        ordersByDay[key].count++;
        ordersByDay[key].revenue += (o.total || 0) * 0.025; // 2.5% platform fee estimate
      }
    }

    const dailyChart = Object.entries(ordersByDay).map(([date, data]) => ({
      date,
      label: date.slice(5),
      orders: data.count,
      revenue: data.revenue,
    }));

    const revenueBySource: Record<string, number> = {};
    for (const r of allRevenues) {
      revenueBySource[r.source] = (revenueBySource[r.source] || 0) + r.amount;
    }
    const revenuePie = Object.entries(revenueBySource).map(([source, amount]) => ({
      name: source,
      value: amount,
    }));

    return NextResponse.json({
      totalUsers,
      totalShops,
      totalProducts,
      totalOrders,
      totalCategories,
      pendingDisputes,
      activeChats,
      todayRevenue,
      pendingPayout,
      roles: { buyer: buyerCount, seller: sellerCount, affiliate: affiliateCount, delivery: deliveryCount, admin: adminCount },
      dailyChart,
      revenuePie,
    });
  } catch (error) {
    console.error('[admin/stats]:', error);
    return NextResponse.json({ error: 'Stats алдаа' }, { status: 500 });
  }
}
