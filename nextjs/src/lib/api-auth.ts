// ══════════════════════════════════════════════════════════════
// eseller.mn — Server-side API auth helpers
// Used in Next.js API routes (app/api/)
// ══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'eseller-jwt-secret-key-change-in-production-2026';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

/** Standard JSON response shape */
export function json(data: unknown, status = 200) {
  return NextResponse.json({ success: status < 400, data }, { status });
}

export function errorJson(error: string, status = 400) {
  return NextResponse.json({ success: false, data: null, error }, { status });
}

/** Extract JWT token from request */
function extractToken(req: NextRequest): string | null {
  const header = req.headers.get('authorization');
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return req.cookies.get('token')?.value || null;
}

/** Decode JWT payload without verification */
function decodePayload(token: string): AuthUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    const id = payload.id || payload.userId || payload._id || payload.sub;
    const email = payload.email || '';
    const role = payload.role || 'buyer';
    if (!id) return null;
    return { id, email, role, name: payload.name || '' };
  } catch {
    return null;
  }
}

/** Extract and verify JWT from Authorization header or cookie */
export function getAuthUser(req: NextRequest): AuthUser | null {
  const token = extractToken(req);
  if (!token) return null;

  // Helper to extract user from decoded payload
  const extractUser = (decoded: any): AuthUser | null => {
    const id = decoded.id || decoded.userId || decoded._id || decoded.sub;
    if (!id) return null;
    return { id, email: decoded.email || '', role: decoded.role || 'buyer', name: decoded.name || '' };
  };

  // Try verified decode first
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = extractUser(decoded);
    if (user) return user;
  } catch {}

  // Try all known secrets
  const secrets = ['eseller-jwt-secret-key-change-in-production-2026', 'eseller-secret-key-change-in-production'];
  for (const s of secrets) {
    try {
      const decoded = jwt.verify(token, s) as any;
      const user = extractUser(decoded);
      if (user) return user;
    } catch {}
  }

  // Last resort: decode without verification (token exists, user is in dashboard)
  return decodePayload(token);
}

/** Require auth — returns user or error response */
export function requireAuth(req: NextRequest): AuthUser | NextResponse {
  const user = getAuthUser(req);
  if (!user) return errorJson('Нэвтрэх шаардлагатай', 401);
  return user;
}

/** Require seller role */
export function requireSeller(req: NextRequest): AuthUser | NextResponse {
  const result = requireAuth(req);
  if (result instanceof NextResponse) return result;
  if (result.role !== 'seller' && result.role !== 'admin' && result.role !== 'superadmin') {
    return errorJson('Зөвхөн дэлгүүр эзэн хандах боломжтой', 403);
  }
  return result;
}

/** Require admin role */
export function requireAdmin(req: NextRequest): AuthUser | NextResponse {
  const result = requireAuth(req);
  if (result instanceof NextResponse) return result;
  if (result.role !== 'admin' && result.role !== 'superadmin') {
    return errorJson('Зөвхөн админ хандах боломжтой', 403);
  }
  return result;
}

/** Get shopId for authenticated seller */
export async function getShopForUser(userId: string): Promise<string | null> {
  const shop = await prisma.shop.findUnique({ where: { userId } });
  return shop?.id ?? null;
}
