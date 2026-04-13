import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, json, errorJson } from '@/lib/api-auth';

// POST /api/live/[id]/end — end a live stream
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { id } = await ctx.params;

  try {
    const stream = await prisma.liveStream.findUnique({ where: { id } });
    if (!stream) return errorJson('Live олдсонгүй', 404);
    if (stream.hostId !== user.id) return errorJson('Зөвхөн хост дуусгах боломжтой', 403);
    if (stream.status === 'ENDED') return errorJson('Live аль хэдийн дууссан', 400);

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.liveStream.update({
        where: { id },
        data: { status: 'ENDED', endedAt: new Date() },
      });

      // If stream had a product scope, reset product live status
      if (stream.productId) {
        await tx.product.update({
          where: { id: stream.productId },
          data: { isLive: false, currentLiveId: null },
        });
      }

      return updated;
    });

    return json(result);
  } catch (e: unknown) {
    return errorJson((e as Error).message, 500);
  }
}
