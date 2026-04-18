import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminDB } from '@/lib/api-auth';

// GET /api/admin/users — list all users
export async function GET(req: NextRequest) {
  const admin = await requireAdminDB(req);
  if (admin instanceof NextResponse) return admin;

  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');
  const search = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (role && role !== 'all') where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Run list + count + role breakdown in parallel; groupBy replaces 5 sequential counts
  const [users, total, roleGroups] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, phone: true, avatar: true, isActive: true, createdAt: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
    prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
  ]);

  const byRole = (r: string) => roleGroups.find((g) => g.role === r)?._count._all ?? 0;
  const breakdown = {
    buyer: byRole('buyer'),
    seller: byRole('seller'),
    affiliate: byRole('affiliate'),
    delivery: byRole('delivery'),
    admin: byRole('admin'),
  };

  return NextResponse.json({ users, total, page, breakdown });
}

// PATCH /api/admin/users — update user role/block
export async function PATCH(req: NextRequest) {
  const admin = await requireAdminDB(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json();
  const { userId, role, isActive } = body;

  if (!userId) return NextResponse.json({ error: 'userId шаардлагатай' }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (role) data.role = role;
  if (isActive !== undefined) data.isActive = isActive;

  const user = await prisma.user.update({ where: { id: userId }, data });

  await prisma.adminLog.create({
    data: { adminId: admin.id, action: 'user.update', after: { userId, ...data } },
  });

  return NextResponse.json(user);
}
