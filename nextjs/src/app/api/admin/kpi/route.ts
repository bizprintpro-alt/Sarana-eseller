import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    const [totalUsers, newUsersMonth, totalEntities, totalProducts, totalOrders, monthlyOrders, weeklyOrders, monthlyRevenue, totalFeedPosts] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.shop.count({ where: { isBlocked: false } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.order.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.order.aggregate({ where: { createdAt: { gte: monthAgo }, status: { not: 'CANCELLED' } }, _sum: { totalAmount: true } }),
      prisma.feedItem.count({ where: { status: 'active' } }),
    ]);

    return NextResponse.json({
      users: { total: totalUsers, newMonth: newUsersMonth },
      entities: { total: totalEntities },
      products: { total: totalProducts },
      orders: { total: totalOrders, monthly: monthlyOrders, weekly: weeklyOrders, monthlyRevenue: monthlyRevenue._sum.totalAmount || 0 },
      feed: { total: totalFeedPosts },
      targets: {
        entities: { current: totalEntities, target: 50, pct: Math.round((totalEntities / 50) * 100) },
        products: { current: totalProducts, target: 500, pct: Math.round((totalProducts / 500) * 100) },
        users: { current: totalUsers, target: 5000, pct: Math.round((totalUsers / 5000) * 100) },
        monthlyRevenue: { current: monthlyRevenue._sum.totalAmount || 0, target: 50_000_000, pct: Math.round(((monthlyRevenue._sum.totalAmount || 0) / 50_000_000) * 100) },
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'KPI тооцоолоход алдаа гарлаа' }, { status: 500 });
  }
}
