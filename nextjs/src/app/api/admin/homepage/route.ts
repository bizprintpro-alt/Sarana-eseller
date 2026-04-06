import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const configs = await prisma.homepageConfig.findMany();
    return NextResponse.json(configs);
  } catch (error) {
    console.error('[homepage]:', error);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const body = await req.json();
    const { key, value } = body;
    const config = await prisma.homepageConfig.upsert({
      where: { key },
      update: { value, updatedBy: admin.id },
      create: { key, value, updatedBy: admin.id, updatedAt: new Date() },
    });
    return NextResponse.json(config);
  } catch (error) {
    console.error('[homepage]:', error);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
