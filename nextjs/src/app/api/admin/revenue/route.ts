import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { getRevenueByPeriod } from '@/lib/revenue';

// GET /api/admin/revenue?period=30
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const days = parseInt(new URL(req.url).searchParams.get('period') || '30');
  const data = await getRevenueByPeriod(days);
  return NextResponse.json(data);
}
