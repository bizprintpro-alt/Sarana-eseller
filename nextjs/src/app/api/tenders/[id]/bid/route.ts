import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, errorJson, requireAuth, getShopForUser } from '@/lib/api-auth';

// POST /api/tenders/[id]/bid — submit a bid
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  try {
    const { id: tenderId } = await ctx.params;
    const body = await req.json();
    const { price, note } = body;

    if (price == null || price <= 0) {
      return errorJson('Үнийн санал (price) шаардлагатай');
    }

    // Get user's shop
    const shopId = await getShopForUser(auth.id);
    if (!shopId) return errorJson('Танд дэлгүүр бүртгэгдээгүй байна', 403);

    // Check tender exists and is open
    const tender = await prisma.governmentTender.findUnique({ where: { id: tenderId } });
    if (!tender) return errorJson('Тендер олдсонгүй', 404);
    if (tender.status !== 'OPEN') return errorJson('Тендер хаагдсан байна');
    if (new Date(tender.deadline) < new Date()) return errorJson('Тендерийн хугацаа дууссан байна');

    // Check if shop already bid on this tender
    const existingBid = await prisma.tenderBid.findFirst({
      where: { tenderId, shopId },
    });
    if (existingBid) return errorJson('Та энэ тендерт аль хэдийн санал өгсөн байна');

    const bid = await prisma.tenderBid.create({
      data: {
        tenderId,
        shopId,
        price: parseFloat(String(price)),
        note: note || null,
        status: 'PENDING',
      },
      include: {
        shop: { select: { id: true, name: true } },
      },
    });

    return json(bid, 201);
  } catch (e: unknown) {
    return errorJson((e as Error).message, 500);
  }
}
