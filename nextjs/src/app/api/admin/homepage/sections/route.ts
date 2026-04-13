import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

const DEFAULT_SECTIONS = [
  { key: 'hero', title: 'Hero Banner', order: 0 },
  { key: 'categories', title: 'Ангилал', order: 1 },
  { key: 'flash_sale', title: 'Flash Sale', order: 2 },
  { key: 'featured_products', title: 'Онцлох бараа', order: 3 },
  { key: 'featured_shops', title: 'Онцлох дэлгүүр', order: 4 },
  { key: 'stats', title: 'Статистик', order: 5 },
  { key: 'testimonials', title: 'Сэтгэгдэл', order: 6 },
  { key: 'promo', title: 'Хямдралтай бараа', order: 7 },
  { key: 'gold', title: 'Gold гишүүнчлэл', order: 8 },
  { key: 'seller', title: 'Борлуулагч', order: 9 },
];

// GET — бүх section + isActive + order
export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  let sections = await prisma.homepageSection.findMany({
    orderBy: { order: 'asc' },
  });

  // Seed defaults if empty
  if (sections.length === 0) {
    await prisma.homepageSection.createMany({
      data: DEFAULT_SECTIONS.map((s) => ({
        key: s.key,
        title: s.title,
        order: s.order,
        isActive: true,
      })),
    });
    sections = await prisma.homepageSection.findMany({
      orderBy: { order: 'asc' },
    });
  }

  return NextResponse.json(sections);
}

// PUT — section идэвхжүүлэх/унтраах
export async function PUT(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json();
  const { key, isActive } = body;
  const section = await prisma.homepageSection.update({
    where: { key },
    data: { isActive },
  });
  return NextResponse.json(section);
}

// POST — order шинэчлэх (drag & drop)
export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json();
  const { orderedKeys } = body as { orderedKeys: string[] };

  await Promise.all(
    orderedKeys.map((key, i) =>
      prisma.homepageSection.update({
        where: { key },
        data: { order: i },
      })
    )
  );

  const sections = await prisma.homepageSection.findMany({
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(sections);
}
