import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson } from '@/lib/api-auth';

type Ctx = { params: Promise<{ id: string }> };

// POST /api/automations/[id]/toggle — toggle isActive
export async function POST(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const existing = await prisma.automationFlow.findUnique({ where: { id } });
    if (!existing) return errorJson('Automation flow not found', 404);

    const flow = await prisma.automationFlow.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return json({ id: flow.id, isActive: flow.isActive });
  } catch (e: unknown) {
    console.error('[automations/toggle]', e);
    return errorJson('Серверийн алдаа', 500);
  }
}
