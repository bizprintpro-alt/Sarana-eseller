import { NextRequest, NextResponse } from 'next/server';
import { requireAdminDB as requireAdmin } from '@/lib/api-auth';
import { getRevenueByPeriod } from '@/lib/revenue';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const days = parseInt(new URL(req.url).searchParams.get('period') || '30');
    const data = await getRevenueByPeriod(days);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[revenue]:', error);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
