import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, json, errorJson } from '@/lib/api-auth';

// GET /api/products/[id]/wholesale — get wholesale prices
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const prices = await prisma.wholesalePrice.findMany({
    where: { productId: id },
    orderBy: { minQty: 'asc' },
  });

  return json(prices);
}

// POST /api/products/[id]/wholesale — add/update wholesale prices
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthUser(req);
  if (!user) return errorJson('Нэвтрэх шаардлагатай', 401);

  const { id } = await params;

  // Verify product ownership
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.userId !== user.id) return errorJson('Эрх байхгүй', 403);

  const { tiers } = await req.json();
  if (!Array.isArray(tiers)) return errorJson('tiers array шаардлагатай');

  // Delete existing and create new
  await prisma.wholesalePrice.deleteMany({ where: { productId: id } });

  const created = await Promise.all(
    tiers.map((t: { minQty: number; price: number; discount: number }) =>
      prisma.wholesalePrice.create({
        data: {
          productId: id,
          minQty: t.minQty,
          price: t.price,
          discount: t.discount,
        },
      })
    )
  );

  return json(created);
}
