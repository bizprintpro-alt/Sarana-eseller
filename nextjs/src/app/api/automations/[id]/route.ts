import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson } from '@/lib/api-auth';

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/automations/[id]
export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const existing = await prisma.automationFlow.findUnique({ where: { id } });
    if (!existing) return errorJson('Automation flow not found', 404);

    const body = await req.json();
    const { name, trigger, isActive, steps } = body;

    const flow = await prisma.automationFlow.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(trigger !== undefined && { trigger }),
        ...(isActive !== undefined && { isActive }),
        ...(steps !== undefined && {
          steps: {
            deleteMany: {},
            create: steps.map((s: { type: string; config: unknown; delay?: number }, i: number) => ({
              order: i,
              type: s.type,
              config: s.config || {},
              delay: s.delay || 0,
            })),
          },
        }),
      },
      include: { steps: { orderBy: { order: 'asc' } } },
    });

    return json(flow);
  } catch (e: unknown) {
    return errorJson((e as Error).message, 500);
  }
}

// DELETE /api/automations/[id]
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const existing = await prisma.automationFlow.findUnique({ where: { id } });
    if (!existing) return errorJson('Automation flow not found', 404);

    await prisma.automationFlow.delete({ where: { id } });
    return json({ deleted: true });
  } catch (e: unknown) {
    return errorJson((e as Error).message, 500);
  }
}
