// ══════════════════════════════════════════════════════════════
// eseller.mn — Server-side API auth helpers
// Used in Next.js API routes (app/api/)
// ══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET env var is required');

/** Sign a JWT token */
export function signToken(payload: { id: string; role: string; email?: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

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

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return extractUser(decoded);
  } catch {
    return null;
  }
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
  if (result.role === 'buyer') {
    return errorJson('Seller account required', 403);
  }
  return result;
}

/** Require admin role (sync — uses token role) */
export function requireAdmin(req: NextRequest): AuthUser | NextResponse {
  const result = requireAuth(req);
  if (result instanceof NextResponse) return result;
  const adminRoles = ['admin', 'superadmin', 'super_admin'];
  if (adminRoles.includes(result.role)) return result;
  return errorJson('Зөвхөн админ хандах боломжтой', 403);
}

/** Require admin role (async — falls back to DB check if token role is wrong) */
export async function requireAdminDB(req: NextRequest): Promise<AuthUser | NextResponse> {
  const result = requireAuth(req);
  if (result instanceof NextResponse) return result;
  const adminRoles = ['admin', 'superadmin', 'super_admin'];
  if (adminRoles.includes(result.role)) return result;
  // Verify from DB in case the token role is stale
  try {
    const dbUser = await prisma.user.findUnique({ where: { id: result.id }, select: { role: true } });
    if (dbUser && adminRoles.includes(dbUser.role)) {
      return { ...result, role: dbUser.role };
    }
  } catch {}
  return errorJson('Зөвхөн админ хандах боломжтой', 403);
}

/** Get shopId for authenticated seller */
export async function getShopForUser(userId: string): Promise<string | null> {
  const shop = await prisma.shop.findUnique({ where: { userId } });
  return shop?.id ?? null;
}
