import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const admin = requireAdmin(req);
    if (admin instanceof NextResponse) return admin;
    const { id } = await ctx.params;
    const body = await req.json();
    const campaign = await prisma.marketingCampaign.update({ where: { id }, data: body });
    return NextResponse.json(campaign);
  } catch (error) {
    console.error('[campaigns/id]:', error);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
