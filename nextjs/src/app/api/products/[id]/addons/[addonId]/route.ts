import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, requireSeller } from '@/lib/api-auth';

type Ctx = { params: Promise<{ id: string; addonId: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = requireSeller(req);
  if (auth instanceof Response) return auth;
  const { addonId } = await ctx.params;
  const body = await req.json();
  const addon = await prisma.addOn.update({
    where: { id: addonId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.price !== undefined && { price: Number(body.price) }),
      ...(body.image !== undefined && { image: body.image }),
      ...(body.available !== undefined && { available: body.available }),
    },
  });
  return json(addon);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const auth = requireSeller(req);
  if (auth instanceof Response) return auth;
  const { addonId } = await ctx.params;
  await prisma.addOn.delete({ where: { id: addonId } });
  return json({ deleted: true });
}
