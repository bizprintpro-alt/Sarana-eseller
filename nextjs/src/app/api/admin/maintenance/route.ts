import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'eseller-admin-2026';

// GET /api/admin/maintenance — check status (public)
export async function GET() {
  try {
    const config = await prisma.platformConfig.findUnique({
      where: { key: 'maintenance_mode' },
    });
    return NextResponse.json({ maintenance: config?.value === 'true' });
  } catch {
    return NextResponse.json({ maintenance: false });
  }
}

// POST /api/admin/maintenance — toggle (secret key auth)
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { enabled } = await req.json();
    const value = enabled ? 'true' : 'false';

    await prisma.platformConfig.upsert({
      where: { key: 'maintenance_mode' },
      update: { value },
      create: { key: 'maintenance_mode', value },
    });

    return NextResponse.json({ success: true, maintenance: enabled });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
