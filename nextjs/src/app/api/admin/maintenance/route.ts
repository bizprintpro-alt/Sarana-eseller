import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function isAdmin(req: NextRequest): Promise<boolean> {
  // Method 1: JWT token from header
  const header = req.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies.get('token')?.value;
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        if (payload.role === 'admin') return true;
      }
    } catch {}
  }

  // Method 2: Check user from DB by email in token
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        if (payload.email) {
          const user = await prisma.user.findUnique({ where: { email: payload.email } });
          if (user?.role === 'admin') return true;
        }
      }
    } catch {}
  }

  return false;
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
  if (!(await isAdmin(req))) {
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
