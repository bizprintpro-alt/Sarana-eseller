import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, json, errorJson } from '@/lib/api-auth';

// GET /api/wallet — get wallet balance
export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof Response) return user;

  let wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!wallet) {
    wallet = await prisma.wallet.create({ data: { userId: user.id, balance: 0, pending: 0 } });
  }

  return json({ balance: wallet.balance, pending: wallet.pending, history: wallet.history || [] });
}

// POST /api/wallet — request payout
export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof Response) return user;

  const { amount, bank, account } = await req.json();
  if (!amount || amount <= 0) return errorJson('Дүн буруу', 400);

  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!wallet || wallet.balance < amount) return errorJson('Үлдэгдэл хүрэлцэхгүй', 400);

  await prisma.wallet.update({
    where: { userId: user.id },
    data: {
      balance: { decrement: amount },
      history: {
        push: { type: 'payout', amount, bank, account, status: 'pending', date: new Date().toISOString() },
      },
    },
  });

  return json({ message: 'Гаргалгааны хүсэлт илгээгдлээ. 24 цагийн дотор шилжүүлнэ.' });
}
