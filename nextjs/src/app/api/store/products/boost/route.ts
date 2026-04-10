import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, json, errorJson } from '@/lib/api-auth';

// POST /api/store/products/boost — boost a product
export async function POST(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof Response) return user;

  const { productId, days = 7 } = await req.json();
  if (!productId) return errorJson('productId шаардлагатай');

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.userId !== user.id) return errorJson('Бараа олдсонгүй', 404);

  const cost = days * 1500; // 1500₮/хоног

  // Check wallet
  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!wallet || wallet.balance < cost) return errorJson(`Үлдэгдэл хүрэлцэхгүй. ${cost.toLocaleString()}₮ шаардлагатай`);

  // Deduct from wallet
  await prisma.wallet.update({ where: { userId: user.id }, data: { balance: { decrement: cost } } });

  // Boost product
  await prisma.product.update({
    where: { id: productId },
    data: { isBoosted: true, boostEndAt: new Date(Date.now() + days * 86400000), boostScore: 100 },
  });

  return json({ message: `${days} хоног boost хийгдлээ! (${cost.toLocaleString()}₮)`, boostEndAt: new Date(Date.now() + days * 86400000) });
}
