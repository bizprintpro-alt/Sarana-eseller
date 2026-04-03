import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json } from '@/lib/api-auth';
import { DEMO_PRODUCTS } from '@/lib/utils';

// GET /api/search/suggest?q=term
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) return json({ suggestions: [] });

  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, price: true, salePrice: true, emoji: true, images: true, category: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    return json({
      suggestions: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.salePrice || p.price,
        image: p.images?.[0] || null,
        emoji: p.emoji,
        category: p.category,
      })),
    });
  } catch {
    // Fallback to demo
    const lower = q.toLowerCase();
    const results = DEMO_PRODUCTS
      .filter((p) => p.name.toLowerCase().includes(lower) || (p.category || '').toLowerCase().includes(lower))
      .slice(0, 8)
      .map((p) => ({ id: p._id, name: p.name, price: p.salePrice || p.price, emoji: p.emoji, category: p.category }));

    return json({ suggestions: results });
  }
}
