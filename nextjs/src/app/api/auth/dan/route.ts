import { NextRequest, NextResponse } from 'next/server';
import { getAuthURL } from '@/lib/dan';

export async function GET(request: NextRequest) {
  const state = crypto.randomUUID();

  // In production, store state in session/cookie for CSRF protection
  const url = getAuthURL(state);

  return NextResponse.redirect(url);
}
