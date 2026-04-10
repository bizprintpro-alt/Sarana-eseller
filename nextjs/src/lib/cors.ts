import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://eseller.mn',
  'https://www.eseller.mn',
  'http://localhost:3000',
  'http://localhost:8081',
  'http://localhost:19006',
];

export function corsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const isAllowed = ALLOWED_ORIGINS.some((o) => origin.startsWith(o)) || !origin;

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin || '*' : 'https://eseller.mn',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };
}

export function handleCors(req: NextRequest): NextResponse | null {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders(req) });
  }
  return null;
}

export function withCors(req: NextRequest, response: NextResponse): NextResponse {
  const headers = corsHeaders(req);
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}
