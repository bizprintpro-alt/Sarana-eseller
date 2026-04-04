import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

type Ctx = { params: Promise<{ id: string }> };

// POST /api/admin/ai/[id]/reject — татгалзах
export async function POST(req: NextRequest, ctx: Ctx) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  try {
    const { id } = await ctx.params;
    const body = await req.json();

    await prisma.aiInsight.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectedReason: body.reason || null,
      },
    });

    await prisma.aiActivityLog.create({
      data: {
        action: 'admin_rejected',
        description: `Admin татгалзлаа — insight ${id}: ${body.reason || 'шалтгаангүй'}`,
        metadata: { insightId: id, adminId: admin.id },
      },
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
