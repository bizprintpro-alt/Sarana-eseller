import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { filterByRadius, sortByDistance } from '@/lib/location/userLocation';

export async function GET(req: NextRequest) {
  try {
    const lat = parseFloat(req.nextUrl.searchParams.get('lat') || '0');
    const lng = parseFloat(req.nextUrl.searchParams.get('lng') || '0');
    const radius = parseFloat(req.nextUrl.searchParams.get('radius') || '5');

    if (!lat || !lng) {
      return NextResponse.json({ error: 'lat and lng required' }, { status: 400 });
    }

    const shops = await prisma.shop.findMany({
      where: { isBlocked: false },
      select: {
        id: true, name: true, slug: true, logo: true, phone: true,
        industry: true, district: true, lat: true, lng: true,
      },
    });

    const nearby = filterByRadius(shops, { lat, lng }, radius);

    return NextResponse.json({
      stores: nearby.map(s => ({
        ...s,
        distanceKm: s.distance,
        distanceLabel: s.distance < 1 ? `${Math.round(s.distance * 1000)}м` : `${s.distance.toFixed(1)}км`,
      })),
      total: nearby.length,
    });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
