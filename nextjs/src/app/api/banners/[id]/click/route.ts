import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Ctx = { params: Promise<{ id: string }> };

// POST /api/banners/[id]/click
export async function POST(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    await prisma.banner.update({ where: { id }, data: { clicks: { increment: 1 } } });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error('[banners/click]', e);
    return NextResponse.json({ success: false, error: 'Серверийн алдаа' }, { status: 500 });
  }
}
