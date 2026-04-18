import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, json, errorJson } from '@/lib/api-auth';

// POST /api/social/posts/[id]/like — toggle like
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id: postId } = await ctx.params;

  try {
    // Check post exists
    const post = await prisma.socialPost.findUnique({ where: { id: postId } });
    if (!post) return errorJson('Пост олдсонгүй', 404);

    // Check if already liked
    const existing = await prisma.socialLike.findUnique({
      where: { postId_userId: { postId, userId: auth.id } },
    });

    if (existing) {
      // Unlike
      await prisma.socialLike.delete({ where: { id: existing.id } });
      const count = await prisma.socialLike.count({ where: { postId } });
      return json({ liked: false, count });
    } else {
      // Like
      await prisma.socialLike.create({
        data: { postId, userId: auth.id },
      });
      const count = await prisma.socialLike.count({ where: { postId } });
      return json({ liked: true, count });
    }
  } catch (err: unknown) {
    console.error('[social/posts/[id]/like]', err);
    return errorJson('Like алдаа', 500);
  }
}
