import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

type Ctx = { params: Promise<{ shopId: string }> };

// PATCH /api/admin/shops/[shopId]/plan — change seller plan
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  try {
    const { shopId } = await ctx.params;
    const body = await req.json();
    const { planKey, expiresAt, note } = body;

    const oldSub = await prisma.shopSubscription.findUnique({ where: { shopId } });

    const sub = await prisma.shopSubscription.upsert({
      where: { shopId },
      update: { planKey, status: 'active', ...(expiresAt ? { expiresAt: new Date(expiresAt) } : {}) },
      create: { shopId, planKey, status: 'active', ...(expiresAt ? { expiresAt: new Date(expiresAt) } : {}) },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: 'plan.change',
        shopId,
        before: oldSub ? { planKey: oldSub.planKey } : null,
        after: { planKey },
        note: note || null,
      },
    });

    return NextResponse.json(sub);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
