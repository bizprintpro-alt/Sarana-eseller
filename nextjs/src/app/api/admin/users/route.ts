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

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, phone: true, avatar: true, isActive: true, createdAt: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  // Role breakdown
  const breakdown = {
    buyer: await prisma.user.count({ where: { role: 'buyer' } }),
    seller: await prisma.user.count({ where: { role: 'seller' } }),
    affiliate: await prisma.user.count({ where: { role: 'affiliate' } }),
    delivery: await prisma.user.count({ where: { role: 'delivery' } }),
    admin: await prisma.user.count({ where: { role: 'admin' } }),
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
