import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminDB as requireAdmin } from '@/lib/api-auth';

type Ctx = { params: Promise<{ id: string }> };

// PUT — засах
export async function PUT(req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { id } = await ctx.params;
  const body = await req.json();
  const banner = await prisma.heroBanner.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.subtitle !== undefined && { subtitle: body.subtitle }),
      ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      ...(body.buttonText !== undefined && { buttonText: body.buttonText }),
      ...(body.buttonLink !== undefined && { buttonLink: body.buttonLink }),
      ...(body.badge !== undefined && { badge: body.badge }),
      ...(body.color !== undefined && { color: body.color }),
      ...(body.gradient !== undefined && { gradient: body.gradient }),
      ...(body.order !== undefined && { order: body.order }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });
  return NextResponse.json(banner);
}

// DELETE — устгах
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { id } = await ctx.params;
  await prisma.heroBanner.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

// PATCH — order/isActive өөрчлөх
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { id } = await ctx.params;
  const body = await req.json();
  const banner = await prisma.heroBanner.update({
    where: { id },
    data: {
      ...(body.order !== undefined && { order: body.order }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });
  return NextResponse.json(banner);
}
