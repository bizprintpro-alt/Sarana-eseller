import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/chat/messages/[sessionId] — fetch messages for polling
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const after = req.nextUrl.searchParams.get('after'); // timestamp for incremental fetch

    const where: Record<string, unknown> = { conversationId: sessionId };
    if (after) {
      where.createdAt = { gt: new Date(after) };
    }

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
