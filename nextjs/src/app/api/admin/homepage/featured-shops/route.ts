import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

// GET — онцлох дэлгүүр жагсаалт
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const featured = await prisma.featuredShop.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  const shopIds = featured.map((f) => f.shopId);
  const shops = await prisma.shop.findMany({
    where: { id: { in: shopIds } },
    select: { id: true, name: true, logo: true, slug: true, storefrontSlug: true },
  });
  const shopMap = new Map(shops.map((s) => [s.id, s]));

  const result = featured.map((f) => ({
    ...f,
    shop: shopMap.get(f.shopId) || null,
  }));

  return NextResponse.json(result);
}

// POST — { shopId } нэмэх
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json();
  const count = await prisma.featuredShop.count({ where: { isActive: true } });
  if (count >= 8) {
    return NextResponse.json({ error: 'Хамгийн ихдээ 8 дэлгүүр нэмэх боломжтой' }, { status: 400 });
  }

  const existing = await prisma.featuredShop.findFirst({
    where: { shopId: body.shopId },
  });
  if (existing) {
    return NextResponse.json({ error: 'Энэ дэлгүүр аль хэдийн нэмэгдсэн' }, { status: 400 });
  }

  const item = await prisma.featuredShop.create({
    data: { shopId: body.shopId, order: count },
  });
  return NextResponse.json(item, { status: 201 });
}

// DELETE — { shopId } хасах
export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id шаардлагатай' }, { status: 400 });

  await prisma.featuredShop.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
