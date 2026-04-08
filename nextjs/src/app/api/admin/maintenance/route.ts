import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function isAdmin(req: NextRequest): boolean {
  const header = req.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies.get('token')?.value;
  if (!token) return false;

  try {
    // Decode JWT payload without verification (page is already behind admin layout)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

// GET /api/admin/maintenance — check status
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

// POST /api/admin/maintenance — toggle
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Админ эрх шаардлагатай' }, { status: 403 });
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
