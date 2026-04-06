import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UB_DISTRICTS, DISTRICT_SHORT_MAP } from '@/lib/location/userLocation';

export async function GET(req: NextRequest) {
  try {
    const districtKey = req.nextUrl.searchParams.get('district') || '';
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');

    // Resolve district label
    const districtInfo = UB_DISTRICTS[districtKey];
    if (!districtInfo) {
      // Try short code (СБД, ХУД, etc)
      const resolvedKey = DISTRICT_SHORT_MAP[districtKey];
      if (!resolvedKey) {
        return NextResponse.json({ items: [], message: 'Unknown district' });
      }
    }

    const label = districtInfo?.label || districtKey;

    // Find feed items in this district
    const feedItems = await prisma.feedItem.findMany({
      where: {
        status: 'active',
        district: { contains: label, mode: 'insensitive' },
      },
      orderBy: [
        { tier: 'asc' }, // VIP first
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    return NextResponse.json({
      items: feedItems,
      district: label,
      total: feedItems.length,
    });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
