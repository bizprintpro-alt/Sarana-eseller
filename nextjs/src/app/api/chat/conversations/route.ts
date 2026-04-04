import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/chat/conversations?shopId=xxx — customer's conversations with a shop
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get('shopId');
    const customerId = searchParams.get('customerId');

    if (!shopId || !customerId) {
      return NextResponse.json({ error: 'shopId, customerId шаардлагатай' }, { status: 400 });
    }

    const conversations = await prisma.conversation.findMany({
      where: { shopId, customerId, status: 'active' },
      orderBy: { lastAt: 'desc' },
      take: 20,
    });

    return NextResponse.json(conversations);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// POST /api/chat/conversations — create or get existing conversation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shopId, customerId, customerName, orderId, orderNumber, productName, productPrice } = body;

    if (!shopId || !customerId || !customerName) {
      return NextResponse.json({ error: 'shopId, customerId, customerName шаардлагатай' }, { status: 400 });
    }

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
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
