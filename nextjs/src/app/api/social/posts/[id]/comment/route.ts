import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, json, errorJson } from '@/lib/api-auth';

// GET /api/social/posts/[id]/comment — list comments
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get('page') || '1'));
  const limit = Math.min(50, Number(sp.get('limit') || '20'));

  try {
    const [comments, total] = await Promise.all([
      prisma.socialComment.findMany({
        where: { postId },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.socialComment.count({ where: { postId } }),
    ]);

    return json({ comments, meta: { total, page, hasMore: page * limit < total } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorJson('Сэтгэгдэл ачаалахад алдаа: ' + message, 500);
  }
}

// POST /api/social/posts/[id]/comment — add comment
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id: postId } = await ctx.params;

  try {
    const body = await req.json();
    const { content } = body as { content?: string };

    if (!content || content.trim().length === 0) {
      return errorJson('Сэтгэгдэл хоосон байна');
    }

    // Check post exists
    const post = await prisma.socialPost.findUnique({ where: { id: postId } });
    if (!post) return errorJson('Пост олдсонгүй', 404);

    const comment = await prisma.socialComment.create({
      data: {
        postId,
        userId: auth.id,
        content: content.trim(),
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    return json(comment, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorJson('Сэтгэгдэл нэмэхэд алдаа: ' + message, 500);
  }
}
