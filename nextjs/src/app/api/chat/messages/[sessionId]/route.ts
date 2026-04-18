import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/api-auth';

// GET /api/chat/messages/[sessionId] — fetch messages for polling
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const auth = getAuthUser(req);

    const conv = await prisma.conversation.findUnique({
      where: { id: sessionId },
      select: { id: true, customerId: true, shopId: true },
    });
    if (!conv) return NextResponse.json({ messages: [] });

    // Access: caller is the customer, anonymous for anon sessions, OR shop owner
    let allowed = false;
    if (auth) {
      if (conv.customerId === auth.id) allowed = true;
      else {
        const shop = await prisma.shop.findFirst({
          where: { id: conv.shopId, userId: auth.id },
          select: { id: true },
        });
        if (shop) allowed = true;
      }
    } else if (conv.customerId === 'anonymous') {
      // Widget polling — if we ever add a session token, check it here. For now
      // anonymous sessions are readable since no user identity is associated.
      allowed = true;
    }
    if (!allowed) return NextResponse.json({ error: 'Эрх байхгүй' }, { status: 403 });

    const after = req.nextUrl.searchParams.get('after');
    const where: Record<string, unknown> = { conversationId: sessionId };
    if (after) where.createdAt = { gt: new Date(after) };

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    return NextResponse.json({
      messages: messages.map(m => ({
        id: m.id,
        role: m.senderRole,
        content: m.text || '',
        time: new Date(m.createdAt).toLocaleTimeString('mn', { hour: '2-digit', minute: '2-digit' }),
        createdAt: m.createdAt,
        isRead: m.isRead,
      })),
      sessionId,
    });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}
