import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, errorJson } from '@/lib/api-auth';

async function userOwnsShop(userId: string, shopId: string): Promise<boolean> {
  const shop = await prisma.shop.findFirst({ where: { id: shopId, userId }, select: { id: true } });
  return !!shop;
}

// GET /api/chat/conversations?shopId=xxx&customerId=yyy — caller must be the customer or own the shop
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get('shopId');
    const customerId = searchParams.get('customerId');

    if (!shopId || !customerId) {
      return errorJson('shopId, customerId шаардлагатай', 400);
    }

    // Access: caller is the buyer OR the shop owner
    if (customerId !== auth.id && !(await userOwnsShop(auth.id, shopId))) {
      return errorJson('Эрх байхгүй', 403);
    }

    const conversations = await prisma.conversation.findMany({
      where: { shopId, customerId, status: 'active' },
      orderBy: { lastAt: 'desc' },
      take: 20,
    });

    return NextResponse.json(conversations);
  } catch (e: unknown) {
    console.error('[chat/conversations GET]', e);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}

// POST /api/chat/conversations — create or get existing conversation (caller is the customer)
export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { shopId, orderId, orderNumber, productName, productPrice } = body;

    if (!shopId) return errorJson('shopId шаардлагатай', 400);

    // Always impersonate the authenticated user — ignore client-supplied customerId/Name to prevent spoofing
    const customerId = auth.id;
    const customerName = auth.name || 'Хэрэглэгч';

    // Verify shop exists
    const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { id: true } });
    if (!shop) return errorJson('Дэлгүүр олдсонгүй', 404);

    // Check for existing active conversation with this order
    const existing = await prisma.conversation.findFirst({
      where: {
        shopId,
        customerId,
        status: 'active',
        ...(orderId ? { orderId } : {}),
      },
      orderBy: { lastAt: 'desc' },
    });

    if (existing) return NextResponse.json(existing);

    const conversation = await prisma.conversation.create({
      data: {
        shopId,
        customerId,
        customerName,
        orderId: orderId || null,
        orderNumber: orderNumber || null,
        productName: productName || null,
        productPrice: productPrice || null,
        tag: orderId ? 'order' : 'question',
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (e: unknown) {
    console.error('[chat/conversations POST]', e);
    return NextResponse.json({ error: 'Серверийн алдаа' }, { status: 500 });
  }
}
