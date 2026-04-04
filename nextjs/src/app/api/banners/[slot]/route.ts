import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Ctx = { params: Promise<{ slot: string }> };

// GET /api/banners/[slot] — public
export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { slot } = await ctx.params;
    const now = new Date();

    const banners = await prisma.banner.findMany({
      where: {
        slot,
        status: 'ACTIVE',
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        refId: true,
        title: true,
        slot: true,
        imageUrl: true,
        imageMobile: true,
        linkUrl: true,
        altText: true,
        bgColor: true,
        sortOrder: true,
      },
    });

    // Increment impressions async (fire-and-forget)
    if (banners.length > 0) {
      const ids = banners.map((b) => b.id);
      prisma.banner.updateMany({ where: { id: { in: ids } }, data: { impressions: { increment: 1 } } }).catch(() => {});
    }

    return NextResponse.json({ success: true, data: banners });
  } catch (e: unknown) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
