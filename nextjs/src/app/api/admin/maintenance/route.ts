import { NextRequest, NextResponse } from 'next/server';
import { requireAdminDB } from '@/lib/api-auth';

// GET /api/admin/maintenance — check status
export async function GET(req: NextRequest) {
  const auth = await requireAdminDB(req);
  if (auth instanceof NextResponse) return auth;

  return NextResponse.json({
    maintenance: process.env.MAINTENANCE_MODE === 'true',
    note: 'Maintenance mode is controlled via MAINTENANCE_MODE env variable in Vercel.',
  });
}
