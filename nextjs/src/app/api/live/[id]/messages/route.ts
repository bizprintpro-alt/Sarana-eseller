import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, json, errorJson } from '@/lib/api-auth';

// GET /api/live/[id]/messages — list last 50 messages
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: streamId } = await ctx.params;

  try {
    const messages = await prisma.liveMessage.findMany({
      where: { streamId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return json(messages);
  } catch (e: unknown) {
    return errorJson((e as Error).message, 500);
  }
}

// POST /api/live/[id]/messages — send message
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { id: streamId } = await ctx.params;

  try {
    const stream = await prisma.liveStream.findUnique({ where: { id: streamId } });
    if (!stream) return errorJson('Live олдсонгүй', 404);
    if (stream.status !== 'LIVE') return errorJson('Live дуусссан', 400);

    const body = await req.json();
    const { content, type } = body as { content: string; type?: string };
    if (!content?.trim()) return errorJson('Мессеж хоосон байна', 400);

    const validTypes = ['TEXT', 'PURCHASE', 'LIKE', 'JOIN'];
    const msgType = type && validTypes.includes(type) ? type : 'TEXT';

    const message = await prisma.liveMessage.create({
      data: {
        streamId,
        userId: user.id,
        content: content.trim(),
        type: msgType,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return json(message, 201);
  } catch (e: unknown) {
    return errorJson((e as Error).message, 500);
  }
}
