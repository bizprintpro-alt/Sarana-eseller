import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/categories/tree — full category tree (public)
export async function GET(req: NextRequest) {
  const entityType = req.nextUrl.searchParams.get('entityType') || undefined;

  const categories = await prisma.category.findMany({
    where: {
      isApproved: true,
      isActive: true,
      level: 0,
      ...(entityType ? { entityTypes: { has: entityType } } : {}),
    },
    include: {
      children: {
        where: { isApproved: true, isActive: true },
        include: {
          children: {
            where: { isApproved: true, isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json({ success: true, data: categories });
}
