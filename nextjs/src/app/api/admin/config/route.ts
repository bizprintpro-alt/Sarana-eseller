import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminDB as requireAdmin } from '@/lib/api-auth';

// GET /api/admin/config — list all platform configs
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  try {
    const configs = await prisma.platformConfig.findMany();
    return NextResponse.json(configs);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// PATCH /api/admin/config — upsert a config value
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'key, value шаардлагатай' }, { status: 400 });
    }

    const config = await prisma.platformConfig.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value), updatedAt: new Date() },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: 'config.update',
        after: { key, value: String(value) },
      },
    });

    return NextResponse.json(config);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
