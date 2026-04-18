import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSeller, getShopForUser, errorJson } from '@/lib/api-auth';

type Ctx = { params: Promise<{ id: string }> };

// GET /api/seller/conversations/[id] — get conversation detail
export async function GET(req: NextRequest, ctx: Ctx) {
  const user = requireSeller(req);
  if (user instanceof NextResponse) return user;

  try {
    const { id } = await ctx.params;
    const shopId = await getShopForUser(user.id);
    if (!shopId) return errorJson('Дэлгүүр олдсонгүй', 404);

    const conversation = await prisma.conversation.findFirst({
      where: { id, shopId },
    });
    if (!conversation) return errorJson('Чат олдсонгүй', 404);

    return NextResponse.json(conversation);
  } catch (e: unknown) {
    console.error('[seller/conversations/[id] GET]', e);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}

// PATCH /api/seller/conversations/[id] — update status/tag
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = requireSeller(req);
  if (user instanceof NextResponse) return user;

  try {
    const { id } = await ctx.params;
    const shopId = await getShopForUser(user.id);
    if (!shopId) return errorJson('Дэлгүүр олдсонгүй', 404);

    const existing = await prisma.conversation.findFirst({
      where: { id, shopId },
    });
    if (!existing) return errorJson('Чат олдсонгүй', 404);

    const body = await req.json();
    const updated = await prisma.conversation.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.tag !== undefined && { tag: body.tag }),
      },
    });

    return NextResponse.json(updated);
  } catch (e: unknown) {
    console.error('[seller/conversations/[id] PATCH]', e);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
