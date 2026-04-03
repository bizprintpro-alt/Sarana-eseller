// ══════════════════════════════════════════════════════════════
// eseller.mn — Server-side API auth helpers
// Used in Next.js API routes (app/api/)
// ══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'eseller-secret-key-change-in-production';

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

/** Extract and verify JWT from Authorization header */
export function getAuthUser(req: NextRequest): AuthUser | null {
  try {
    const header = req.headers.get('authorization');
    if (!header?.startsWith('Bearer ')) return null;

    const token = header.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; name: string };

    return { id: decoded.id, email: decoded.email, role: decoded.role, name: decoded.name };
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
  if (result.role !== 'seller' && result.role !== 'admin') {
    return errorJson('Зөвхөн дэлгүүр эзэн хандах боломжтой', 403);
  }
  return result;
}

/** Get shopId for authenticated seller */
export async function getShopForUser(userId: string): Promise<string | null> {
  const shop = await prisma.shop.findUnique({ where: { userId } });
  return shop?.id ?? null;
}
