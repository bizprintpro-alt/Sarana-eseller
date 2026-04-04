import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/cron/banners — auto-activate scheduled, auto-expire active
export async function GET() {
  try {
    const now = new Date();

    const [activated, expired] = await Promise.all([
      prisma.banner.updateMany({
        where: { status: 'SCHEDULED', startsAt: { lte: now } },
        data: { status: 'ACTIVE' },
      }),
      prisma.banner.updateMany({
        where: { status: 'ACTIVE', endsAt: { lt: now } },
        data: { status: 'EXPIRED' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { activated: activated.count, expired: expired.count },
    });
  } catch (e: unknown) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
