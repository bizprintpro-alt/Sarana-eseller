import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, json, errorJson } from '@/lib/api-auth';

async function resolveParticipant(userId: string, conversationId: string) {
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, customerId: true, shopId: true },
  });
  if (!conv) return null;
  if (conv.customerId === userId) return { conv, role: 'customer' as const };
  const shop = await prisma.shop.findFirst({ where: { id: conv.shopId, userId }, select: { id: true } });
  if (shop) return { conv, role: 'seller' as const };
  return null;
}

// GET /api/chat/conversations/[id]/messages
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = requireAuth(req);
  if (user instanceof Response) return user;
  const { id } = await params;

  const access = await resolveParticipant(user.id, id);
  if (!access) return errorJson('Эрх байхгүй', 403);

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });

  await prisma.message.updateMany({
    where: { conversationId: id, senderId: { not: user.id }, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  return json(messages);
}

// POST /api/chat/conversations/[id]/messages
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = requireAuth(req);
  if (user instanceof Response) return user;
  const { id } = await params;

  const { content, imageUrl } = await req.json();
  if (!content && !imageUrl) return errorJson('content шаардлагатай');
  if (content && (typeof content !== 'string' || content.length > 4000)) {
    return errorJson('Мессеж хэт урт байна');
  }

  const access = await resolveParticipant(user.id, id);
  if (!access) return errorJson('Эрх байхгүй', 403);

  const message = await prisma.message.create({
    data: { conversationId: id, senderId: user.id, senderRole: access.role, text: content || null, imageUrl: imageUrl || null },
  });

  await prisma.conversation.update({
    where: { id },
    data: { lastMessage: content?.slice(0, 100) || '📷 Зураг', lastAt: new Date(), ...(access.role === 'customer' ? { unreadCount: { increment: 1 } } : {}) },
  });

  return json(message);
}
