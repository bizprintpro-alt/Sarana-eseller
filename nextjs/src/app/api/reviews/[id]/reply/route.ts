import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/api-auth';

// POST /api/reviews/[id]/reply — seller replies to review
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'Нэвтрэх шаардлагатай' }, { status: 401 });

  const { id } = await params;
  const { reply } = await req.json();
  if (!reply?.trim()) return NextResponse.json({ error: 'Хариу бичнэ үү' }, { status: 400 });

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return NextResponse.json({ error: 'Үнэлгээ олдсонгүй' }, { status: 404 });

  // Verify seller owns the product
  const product = await prisma.product.findUnique({ where: { id: review.productId } });
  if (!product || product.userId !== user.id) {
    return NextResponse.json({ error: 'Зөвхөн борлуулагч хариу бичих боломжтой' }, { status: 403 });
  }

  const updated = await prisma.review.update({
    where: { id },
    data: { sellerReply: reply.trim() },
  });

  return NextResponse.json(updated);
}
