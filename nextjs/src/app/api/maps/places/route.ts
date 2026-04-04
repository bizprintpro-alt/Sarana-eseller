import { NextRequest, NextResponse } from 'next/server';
import { getPlaceSuggestions } from '@/lib/maps/googleMaps';

// GET /api/maps/places?q=Байсан&token=xxx — Places autocomplete
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q     = searchParams.get('q') || '';
    const token = searchParams.get('token') || '';

    if (q.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = await getPlaceSuggestions(q, token);
    return NextResponse.json({ suggestions });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
