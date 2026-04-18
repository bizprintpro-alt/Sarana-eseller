import { NextRequest, NextResponse } from 'next/server';
import { getPlaceDetails } from '@/lib/maps/googleMaps';

// GET /api/maps/place-details?placeId=xxx&token=xxx — Place details
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get('placeId') || '';
    const token   = searchParams.get('token') || '';

    if (!placeId) {
      return NextResponse.json({ error: 'placeId шаардлагатай' }, { status: 400 });
    }

    const details = await getPlaceDetails(placeId, token);
    if (!details) {
      return NextResponse.json({ error: 'Place олдсонгүй' }, { status: 404 });
    }

    return NextResponse.json(details);
  } catch (e: unknown) {
    console.error('[maps/place-details]', e);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
