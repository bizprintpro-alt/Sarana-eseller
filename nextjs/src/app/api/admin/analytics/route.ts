import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminDB as requireAdmin } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

    // All independent queries in ONE Promise.all — was ~4 sequential waves.
    // roleGroups replaces 5 per-role count() calls (groupBy).
    const [
      totalUsers, newUsers7d, newUsers30d, totalOrders, orders30d,
      totalProducts, totalShops, revenues30d, recentUsers, recentOrders,
      roleGroups, topProducts, paidOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.product.count({ where: { isDemo: false, isActive: true } }),
      prisma.shop.count({ where: { isDemo: false } }),
      prisma.platformRevenue.findMany({ where: { date: { gte: thirtyDaysAgo } } }).catch(() => [] as { amount: number }[]),
      prisma.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, total: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      prisma.product.findMany({
        where: { isDemo: false, isActive: true },
        select: { id: true, name: true, reviewCount: true, price: true },
        orderBy: { reviewCount: 'desc' },
        take: 10,
      }),
      prisma.order.count({ where: { status: { in: ['paid', 'delivered', 'completed'] } } }),
    ]);
    const totalRevenue30d = revenues30d.reduce((s, r) => s + r.amount, 0);

    const dailySignups: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      dailySignups[d.toISOString().slice(0, 10)] = 0;
    }
    for (const u of recentUsers) {
      const key = new Date(u.createdAt).toISOString().slice(0, 10);
      if (dailySignups[key] !== undefined) dailySignups[key]++;
    }

    const dailyOrders: Record<string, { count: number; revenue: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      dailyOrders[d.toISOString().slice(0, 10)] = { count: 0, revenue: 0 };
    }
    for (const o of recentOrders) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      if (dailyOrders[key]) {
        dailyOrders[key].count++;
        dailyOrders[key].revenue += o.total || 0;
      }
    }

    const dailyChart = Object.entries(dailySignups).map(([date, signups]) => ({
      date,
      label: date.slice(5),
      signups,
      orders: dailyOrders[date]?.count || 0,
      revenue: dailyOrders[date]?.revenue || 0,
    }));

    const roleCount = (r: string) =>
      roleGroups.find((g) => g.role === r)?._count._all ?? 0;
    const buyers = roleCount('buyer');
    const sellers = roleCount('seller');
    const affiliates = roleCount('affiliate');
    const drivers = roleCount('delivery');
    const admins = roleCount('admin');

    return NextResponse.json({
      overview: { totalUsers, newUsers7d, newUsers30d, totalOrders, orders30d, totalProducts, totalShops, totalRevenue30d },
      dailyChart,
      roleDistribution: [
        { name: 'Худалдан авагч', value: buyers, color: '#3B82F6' },
        { name: 'Дэлгүүр эзэн', value: sellers, color: '#22C55E' },
        { name: 'Борлуулагч', value: affiliates, color: '#F59E0B' },
        { name: 'Жолооч', value: drivers, color: '#8B5CF6' },
        { name: 'Админ', value: admins, color: '#EF4444' },
      ],
      topProducts,
      funnel: { visits: totalUsers, signups: totalUsers, orders: totalOrders, paid: paidOrders },
    });
  } catch (error) {
    console.error('[admin/analytics]:', error);
    return NextResponse.json({ error: 'Analytics алдаа' }, { status: 500 });
  }
}
