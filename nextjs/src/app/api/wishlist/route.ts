import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json, requireAuth } from '@/lib/api-auth';

// GET /api/wishlist — list user's wishlist product IDs
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: auth.id },
      select: { productId: true },
    });
    return json({ productIds: items.map((i) => i.productId) });
  } catch {
    return json({ productIds: [] });
  }
}
