import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminDB as requireAdmin } from '@/lib/api-auth';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const admin = await requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const { id } = await ctx.params;
    const body = await req.json();
    const slot = await prisma.bannerSlot.update({ where: { id }, data: body });
    return NextResponse.json(slot);
  } catch (error) {
    console.error('[banner-slots/id]:', error);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
