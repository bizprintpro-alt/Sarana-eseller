import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateCoords } from '@/lib/location/validateCoords';

// Vercel Cron: 7 хоног бүр Пүрэв гаригт 10:00-д ажиллана
// vercel.json: { "crons": [{ "path": "/api/cron/check-locations", "schedule": "0 10 * * 4" }] }

export async function GET(req: NextRequest) {
  // Cron secret шалгалт
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const locations = await prisma.storeLocation.findMany({
      where: { isActive: true },
      select: { id: true, lat: true, lng: true },
    });

    // Group by identical outcome so we can issue 1 updateMany per (status, needsUpdate) pair
    // instead of one UPDATE per location. For 10K rows: ~2-6 queries vs 10K.
    const now = new Date();
    const buckets = new Map<string, { status: string; needsUpdate: boolean; ids: string[] }>();
    for (const loc of locations) {
      const check = validateCoords(loc.lat, loc.lng);
      const key = `${check.status}|${check.needsUpdate}`;
      const bucket = buckets.get(key) ?? { status: check.status, needsUpdate: check.needsUpdate, ids: [] };
      bucket.ids.push(loc.id);
      buckets.set(key, bucket);
    }

    let valid = 0;
    let flagged = 0;
    await Promise.all(
      Array.from(buckets.values()).map((b) => {
        if (b.needsUpdate) flagged += b.ids.length;
        else valid += b.ids.length;
        return prisma.storeLocation.updateMany({
          where: { id: { in: b.ids } },
          data: { coordStatus: b.status, coordNeedsUpdate: b.needsUpdate, coordCheckedAt: now },
        });
      }),
    );

    return NextResponse.json({
      total: locations.length,
      valid,
      flagged,
      checkedAt: new Date().toISOString(),
    });
  } catch (e: unknown) {
    console.error('Coord check cron error:', e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
