import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/locations — list all store locations for admin
export async function GET(req: NextRequest) {
  try {
    const locations = await prisma.storeLocation.findMany({
      where: { isActive: true },
      orderBy: [{ coordNeedsUpdate: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(locations);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
