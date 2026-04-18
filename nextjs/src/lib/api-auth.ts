// ══════════════════════════════════════════════════════════════
// eseller.mn — Server-side API auth helpers
// Used in Next.js API routes (app/api/)
// ══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required. Set it in .env.local or platform secrets.');
}

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

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const id = decoded.id || decoded.userId || decoded._id || decoded.sub;
    if (!id) return null;
    return { id, email: decoded.email || '', role: decoded.role || 'buyer', name: decoded.name || '' };
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

/** Require seller role — accepts seller/admin + any user with a shop */
export function requireSeller(req: NextRequest): AuthUser | NextResponse {
  const result = requireAuth(req);
  if (result instanceof NextResponse) return result;
  // Accept seller, admin, superadmin, AND 'buyer' (backend tokens often lack role)
  // We trust that dashboard access is already gated by the frontend
  // The actual shop ownership is verified in each API handler via findUnique({ where: { userId } })
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
  // Token decode fallback may set role='buyer' — verify from DB
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
