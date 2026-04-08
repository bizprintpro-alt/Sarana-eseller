import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// All possible JWT secrets - try each one to verify token
const JWT_SECRETS = [
  process.env.JWT_SECRET,
  'eseller-jwt-secret-key-change-in-production-2026',
  'eseller-secret-key-change-in-production',
].filter(Boolean) as string[];

function verifyAdmin(req: NextRequest): boolean {
  const header = req.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies.get('token')?.value;
  if (!token) return false;

  for (const secret of JWT_SECRETS) {
    try {
      const decoded = jwt.verify(token, secret) as { role?: string };
      if (decoded.role === 'admin') return true;
    } catch {
      continue;
    }
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
  if (!verifyAdmin(req)) {
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
