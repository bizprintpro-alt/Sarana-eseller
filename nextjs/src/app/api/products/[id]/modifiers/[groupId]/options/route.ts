import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson, requireSeller } from '@/lib/api-auth';

type Ctx = { params: Promise<{ id: string; groupId: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const auth = requireSeller(req);
  if (auth instanceof Response) return auth;
  const { groupId } = await ctx.params;
  const { name, price } = await req.json();
  if (!name) return errorJson('Нэр шаардлагатай');

  const count = await prisma.modifierOption.count({ where: { groupId } });
  const option = await prisma.modifierOption.create({
    data: { groupId, name, price: Number(price) || 0, sortOrder: count },
  });
  return json(option, 201);
}
