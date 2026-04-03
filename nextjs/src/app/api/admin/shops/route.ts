import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson, requireAuth } from '@/lib/api-auth';

// GET /api/admin/shops?status=...&search=...&page=1&limit=10
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;
  if (auth.role !== 'admin') return errorJson('Админ эрх шаардлагатай', 403);

  const sp = req.nextUrl.searchParams;
  const status = sp.get('status');
  const search = sp.get('search');
  const page = Math.max(1, Number(sp.get('page') || '1'));
  const limit = Math.min(50, Number(sp.get('limit') || '10'));
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status === 'verified') where.locationStatus = 'verified';
  else if (status === 'pending') where.locationStatus = 'pending';
  else if (status === 'no_coords') where.lat = null;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { district: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [shops, total] = await Promise.all([
    prisma.shop.findMany({
      where,
      include: { user: { select: { name: true, email: true } }, shopType: true },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.shop.count({ where }),
  ]);

  // Stats
  const [totalShops, verified, pendingCount, noCoords] = await Promise.all([
    prisma.shop.count(),
    prisma.shop.count({ where: { locationStatus: 'verified' } }),
    prisma.shop.count({ where: { locationStatus: 'pending' } }),
    prisma.shop.count({ where: { lat: null } }),
  ]);

  return json({
    shops,
    total,
    page,
    pages: Math.ceil(total / limit),
    stats: { total: totalShops, verified, pending: pendingCount, noCoords },
  });
}
