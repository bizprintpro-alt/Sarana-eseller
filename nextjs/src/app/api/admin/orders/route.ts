import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) return NextResponse.json({ orders: [], error: 'Backend URL not configured' }, { status: 500 });

    const sp = request.nextUrl.searchParams.toString();
    const res = await fetch(`${backendUrl}/api/admin/orders${sp ? `?${sp}` : ''}`, {
      headers: { Authorization: request.headers.get('Authorization') || '' },
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[admin/orders] Backend error:', res.status, text);
      return NextResponse.json({ orders: [], error: 'Backend error' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[admin/orders] Fetch failed:', error);
    return NextResponse.json({ orders: [], error: 'Failed to fetch' }, { status: 500 });
  }
}
