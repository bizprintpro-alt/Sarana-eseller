import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminDB as requireAdmin } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Core counts (parallel)
    const [
      totalUsers,
      totalShops,
      totalProducts,
      totalOrders,
      totalCategories,
      pendingDisputes,
      activeChats,
      buyerCount,
      sellerCount,
      affiliateCount,
      deliveryCount,
      adminCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.shop.count({ where: { isDemo: false } }),
      prisma.product.count({ where: { isDemo: false, isActive: true } }),
      prisma.order.count(),
      prisma.category.count(),
      prisma.dispute.count({ where: { status: 'open' } }).catch(() => 0),
      prisma.conversation.count().catch(() => 0),
      prisma.user.count({ where: { role: 'buyer' } }),
      prisma.user.count({ where: { role: 'seller' } }),
      prisma.user.count({ where: { role: 'affiliate' } }),
      prisma.user.count({ where: { role: 'delivery' } }),
      prisma.user.count({ where: { role: 'admin' } }),
    ]);

    // Today's revenue
    const todayRevenues = await prisma.platformRevenue.findMany({
      where: { date: { gte: today } },
    }).catch(() => []);
    const todayRevenue = todayRevenues.reduce((s, r) => s + r.amount, 0);

    // Pending payouts
    const wallets = await prisma.wallet.findMany({
      where: { balance: { gt: 0 } },
      select: { balance: true },
    }).catch(() => []);
    const pendingPayout = wallets.reduce((s, w) => s + w.balance, 0);

    // Orders per day (last 30 days) for line chart
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const recentOrders = await prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: 'asc' },
    }).catch(() => []);

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

    // Revenue by source (pie chart)
    const allRevenues = await prisma.platformRevenue.findMany({
      where: { date: { gte: thirtyDaysAgo } },
    }).catch(() => []);
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
