import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson, requireSeller } from '@/lib/api-auth';

type Ctx = { params: Promise<{ id: string; groupId: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = requireSeller(req);
  if (auth instanceof Response) return auth;
  const { groupId } = await ctx.params;
  const body = await req.json();
  const group = await prisma.modifierGroup.update({
    where: { id: groupId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.required !== undefined && { required: body.required }),
      ...(body.multiple !== undefined && { multiple: body.multiple }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
    },
    include: { options: true },
  });
  return json(group);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = requireSeller(req);
  if (auth instanceof Response) return auth;
  const { groupId } = await ctx.params;
  await prisma.modifierGroup.delete({ where: { id: groupId } });
  return json({ deleted: true });
}
