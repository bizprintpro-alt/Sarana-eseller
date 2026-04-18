import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminDB as requireAdmin } from '@/lib/api-auth';

type Ctx = { params: Promise<{ shopId: string }> };

// PATCH /api/admin/shops/[shopId]/commission — override commission rate
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  try {
    const { shopId } = await ctx.params;
    const body = await req.json();
    const { commissionRate, note } = body;

    const oldSub = await prisma.shopSubscription.findUnique({ where: { shopId } });

    const sub = await prisma.shopSubscription.upsert({
      where: { shopId },
      update: { commissionRate: commissionRate ?? null },
      create: { shopId, planKey: 'free', commissionRate: commissionRate ?? null },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: 'commission.override',
        shopId,
        before: { commissionRate: oldSub?.commissionRate ?? null },
        after: { commissionRate: commissionRate ?? null },
        note: note || null,
      },
    });

    return NextResponse.json(sub);
  } catch (e: unknown) {
    console.error('[admin/shops/commission]', e);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
