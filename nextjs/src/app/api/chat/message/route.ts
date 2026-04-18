import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAiReply } from '@/lib/chat/aiChatEngine';
import { getAuthUser } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, shopId, message, history } = await req.json();

    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });
    if (typeof message !== 'string' || message.length > 4000) {
      return NextResponse.json({ error: 'Мессеж хэт урт байна' }, { status: 400 });
    }

    const auth = getAuthUser(req);

    // If we have a sessionId, save to DB (real conversation)
    if (sessionId) {
      // Find or verify conversation
      let conversation = await prisma.conversation.findUnique({ where: { id: sessionId } });

      if (!conversation && shopId) {
        // Anonymous widget can start a new thread tied to the shop
        conversation = await prisma.conversation.create({
          data: {
            shopId,
            customerId: auth?.id || 'anonymous',
            customerName: auth?.name || 'Зочин',
            status: 'active',
            tag: 'question',
          },
        });
      }

      if (!conversation) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

      // Determine actual role server-side — NEVER trust client-supplied role.
      // - If authed user is the shop owner → seller
      // - If authed user is the customer on the conversation → customer
      // - Otherwise reject (prevents impersonation across arbitrary sessions)
      let senderRole: 'customer' | 'seller' = 'customer';
      let senderId: string;
      if (auth) {
        const shop = await prisma.shop.findFirst({
          where: { id: conversation.shopId, userId: auth.id },
          select: { id: true },
        });
        if (shop) {
          senderRole = 'seller';
          senderId = auth.id;
        } else if (conversation.customerId === auth.id) {
          senderRole = 'customer';
          senderId = auth.id;
        } else {
          return NextResponse.json({ error: 'Эрх байхгүй' }, { status: 403 });
        }
      } else {
        // Anonymous widget — only allowed for sessions created as anonymous
        if (conversation.customerId !== 'anonymous') {
          return NextResponse.json({ error: 'Нэвтэрнэ үү' }, { status: 401 });
        }
        senderId = 'anonymous';
      }

      const savedMsg = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId,
          senderRole,
          text: message,
        },
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessage: message, updatedAt: new Date() },
      });

      // If customer message and no seller online → AI reply
      if (senderRole !== 'seller') {
        const aiReply = await getAiReply(message, conversation.shopId, history || []);

        const aiMsg = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId: 'ai',
            senderRole: 'ai',
            text: aiReply,
          },
        });

        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { lastMessage: aiReply, updatedAt: new Date() },
        });

        return NextResponse.json({
          userMessage: savedMsg,
          reply: aiReply,
          replyMessage: aiMsg,
          sessionId: conversation.id,
        });
      }

      return NextResponse.json({ message: savedMsg, sessionId: conversation.id });
    }

    // Fallback: no session, just get AI reply (widget initial mode)
    const reply = await getAiReply(message, shopId || '', history || []);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ reply: 'Уучлаарай, алдаа гарлаа.' });
  }
}
