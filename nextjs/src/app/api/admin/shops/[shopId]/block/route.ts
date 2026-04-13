import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminDB as requireAdmin } from '@/lib/api-auth';

type Ctx = { params: Promise<{ shopId: string }> };

// PATCH /api/admin/shops/[shopId]/block — block/unblock seller
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  try {
    const { shopId } = await ctx.params;
    const body = await req.json();
    const { blocked, reason } = body;

    await prisma.shop.update({
      where: { id: shopId },
      data: { isBlocked: blocked, blockReason: blocked ? (reason || null) : null },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: blocked ? 'shop.block' : 'shop.unblock',
        shopId,
        after: { blocked, reason: reason || null },
      },
    });

    return NextResponse.json({ success: true, blocked });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
