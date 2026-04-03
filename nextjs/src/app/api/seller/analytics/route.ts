import { NextRequest } from 'next/server';
import { json, errorJson, requireSeller } from '@/lib/api-auth';

// Demo analytics data (DB-independent)
function generateDemoAnalytics(days: number) {
  const daily = [];
  const now = new Date();
  let totalRevenue = 0;
  let totalOrders = 0;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const revenue = Math.floor(50000 + Math.random() * 200000);
    const orders = Math.floor(3 + Math.random() * 15);
    totalRevenue += revenue;
    totalOrders += orders;
    daily.push({
      date: date.toISOString().split('T')[0],
      revenue,
      orders,
    });
  }

  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const prevRevenue = totalRevenue * (0.8 + Math.random() * 0.3);
  const growth = Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100);

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    revenueGrowth: growth,
    daily,
    topProducts: [
      { rank: 1, name: 'Premium цагаан цамц', orders: 42, revenue: 1470000 },
      { rank: 2, name: 'Sporty гутал Air', orders: 38, revenue: 2622000 },
      { rank: 3, name: 'Bluetooth чихэвч', orders: 28, revenue: 2772000 },
      { rank: 4, name: 'Leather цүнх', orders: 24, revenue: 1800000 },
      { rank: 5, name: 'Гоо сайхны багц', orders: 19, revenue: 988000 },
    ],
  };
}

// GET /api/seller/analytics?period=7d|30d|90d
export async function GET(req: NextRequest) {
  const auth = requireSeller(req);
  if (auth instanceof Response) return auth;

  const period = req.nextUrl.searchParams.get('period') || '7d';
  const days = period === '90d' ? 90 : period === '30d' ? 30 : 7;

  const data = generateDemoAnalytics(days);
  return json(data);
}
