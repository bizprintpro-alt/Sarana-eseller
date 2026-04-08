import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/maintenance-status — public endpoint, no auth needed
export async function GET() {
  try {
    const config = await prisma.platformConfig.findUnique({
      where: { key: 'maintenance_mode' },
    });
    return NextResponse.json({
      maintenance: config?.value === 'true',
    });
  } catch {
    return NextResponse.json({ maintenance: false });
  }
}
