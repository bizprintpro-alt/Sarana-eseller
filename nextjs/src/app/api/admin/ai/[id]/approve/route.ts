import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminDB as requireAdmin } from '@/lib/api-auth';

type Ctx = { params: Promise<{ id: string }> };

// POST /api/admin/ai/[id]/approve — зөвшөөрч хэрэгжүүлэх
export async function POST(req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  try {
    const { id } = await ctx.params;

    await prisma.aiInsight.update({
      where: { id },
      data: { status: 'APPROVED', resolvedBy: admin.id },
    });

    await prisma.aiActivityLog.create({
      data: {
        action: 'admin_approved',
        description: `Admin зөвшөөрлөө — insight ${id}`,
        metadata: { insightId: id, adminId: admin.id },
      },
    });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error('[admin/ai/approve]', e);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
