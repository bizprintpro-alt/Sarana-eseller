import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, json } from '@/lib/api-auth';

// GET /api/chat/unread — total unread count for current user
export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof Response) return user;

  // Count unread messages where user is NOT the sender
  const unread = await prisma.message.count({
    where: {
      senderId: { not: user.id },
      isRead: false,
      conversation: {
        OR: [{ customerId: user.id }, { shopId: { in: await getShopIds(user.id) } }],
      },
    },
  });

  return json({ count: unread });
}

async function getShopIds(userId: string): Promise<string[]> {
  const shops = await prisma.shop.findMany({ where: { userId }, select: { id: true } });
  return shops.map(s => s.id);
}
