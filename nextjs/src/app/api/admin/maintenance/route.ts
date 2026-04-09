import { NextResponse } from 'next/server';

// GET /api/admin/maintenance — check status
export async function GET() {
  return NextResponse.json({
    maintenance: process.env.MAINTENANCE_MODE === 'true',
    note: 'Maintenance mode is controlled via MAINTENANCE_MODE env variable in Vercel.',
  });
}
