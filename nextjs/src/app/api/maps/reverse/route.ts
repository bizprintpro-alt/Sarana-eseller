import { NextRequest, NextResponse } from 'next/server';
import { reverseGeocode } from '@/lib/maps/googleMaps';

// GET /api/maps/reverse?lat=47.8864&lng=106.9057 — координатаас хаяг авах
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: 'Координат буруу' }, { status: 400 });
    }

    const address = await reverseGeocode(lat, lng);
    if (!address) {
      return NextResponse.json({ error: 'Хаяг олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json({ address });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
