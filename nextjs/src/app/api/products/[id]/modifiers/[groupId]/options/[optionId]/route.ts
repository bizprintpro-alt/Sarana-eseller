import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, requireSeller } from '@/lib/api-auth';

type Ctx = { params: Promise<{ id: string; groupId: string; optionId: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = requireSeller(req);
  if (auth instanceof Response) return auth;
  const { optionId } = await ctx.params;
  const body = await req.json();
  const option = await prisma.modifierOption.update({
    where: { id: optionId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.price !== undefined && { price: Number(body.price) }),
      ...(body.available !== undefined && { available: body.available }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
    },
  });
  return json(option);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = requireSeller(req);
  if (auth instanceof Response) return auth;
  const { optionId } = await ctx.params;
  await prisma.modifierOption.delete({ where: { id: optionId } });
  return json({ deleted: true });
}
