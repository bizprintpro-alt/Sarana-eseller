import { NextResponse } from 'next/server';

// GET /api/maintenance-status — reads from env variable, no DB call
export async function GET() {
  return NextResponse.json({
    maintenance: process.env.MAINTENANCE_MODE === 'true',
  });
}
