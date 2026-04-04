import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/campaigns/[id] — update status
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { id } = await ctx.params;
  const body = await req.json();
  const campaign = await prisma.marketingCampaign.update({ where: { id }, data: body });
  return NextResponse.json(campaign);
}
