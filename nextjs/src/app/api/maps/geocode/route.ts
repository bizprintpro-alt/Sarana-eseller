import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress } from '@/lib/maps/googleMaps';
import { validateCoords } from '@/lib/location/validateCoords';

// POST /api/maps/geocode — хаягаас координат авах
export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();
    if (!address?.trim()) {
      return NextResponse.json({ error: 'Хаяг хоосон байна' }, { status: 400 });
    }

    const result = await geocodeAddress(address);
    if (!result) {
      return NextResponse.json({ error: 'Хаяг олдсонгүй' }, { status: 404 });
    }

    const coordCheck = validateCoords(result.lat, result.lng);
    return NextResponse.json({ ...result, coordCheck });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
