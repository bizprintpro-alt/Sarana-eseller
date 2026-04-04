import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Ctx = { params: Promise<{ id: string }> };

// GET /api/chat/conversations/[id]/messages — list messages (customer side)
export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    return NextResponse.json(messages);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// POST /api/chat/conversations/[id]/messages — send message as customer
export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();

    if (!body.text?.trim() && !body.imageUrl) {
      return NextResponse.json({ error: 'Мессеж хоосон байна' }, { status: 400 });
    }

    if (!body.senderId) {
      return NextResponse.json({ error: 'senderId шаардлагатай' }, { status: 400 });
    }

    const conv = await prisma.conversation.findUnique({ where: { id } });
    if (!conv) return NextResponse.json({ error: 'Чат олдсонгүй' }, { status: 404 });

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: body.senderId,
        senderRole: 'customer',
        text: body.text?.trim() || null,
        imageUrl: body.imageUrl || null,
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id },
      data: {
        lastMessage: body.text?.trim()?.slice(0, 100) || 'Зураг',
        lastAt: new Date(),
        unreadCount: { increment: 1 },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
