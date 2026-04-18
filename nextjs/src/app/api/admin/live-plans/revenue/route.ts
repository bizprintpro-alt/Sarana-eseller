import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, json, errorJson } from '@/lib/api-auth';
import { LIVE_PLANS } from '@/lib/live-plans';

// GET /api/admin/live-plans/revenue — live plan revenue stats
export async function GET(req: NextRequest) {
  const user = requireAdmin(req);
  if (user instanceof NextResponse) return user;

  try {
    const basicShops = await prisma.shop.count({ where: { livePlan: 'BASIC' } });
    const standardShops = await prisma.shop.count({ where: { livePlan: 'STANDARD' } });
    const proShops = await prisma.shop.count({ where: { livePlan: 'PRO' } });
    const enterpriseShops = await prisma.shop.count({ where: { livePlan: 'ENTERPRISE' } });

    const monthlyRevenue =
      basicShops * LIVE_PLANS.BASIC.price +
      standardShops * LIVE_PLANS.STANDARD.price +
      proShops * LIVE_PLANS.PRO.price +
      enterpriseShops * LIVE_PLANS.ENTERPRISE.price;

    return json({
      basicShops,
      standardShops,
      proShops,
      enterpriseShops,
      monthlyRevenue,
    });
  } catch (e: unknown) {
    console.error('[admin/live-plans/revenue]', e);
    return errorJson('Серверийн алдаа', 500);
  }
}
