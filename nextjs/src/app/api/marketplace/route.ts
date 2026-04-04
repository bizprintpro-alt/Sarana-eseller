export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { json } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  console.log('DB_URL exists:', !!process.env.DATABASE_URL);
  console.log('DB_URL prefix:', process.env.DATABASE_URL?.substring(0, 30));
  try { const c = await prisma.product.count(); console.log('Product count:', c); } catch(e: any) { console.error('DB_ERR:', e.message); }

  const sp = req.nextUrl.searchParams;
  const type = sp.get('type') || 'all';
  const category = sp.get('category');
  const search = sp.get('search');
  const sort = sp.get('sort') || 'newest';
  const limit = Math.min(Number(sp.get('limit') || '40'), 100);
  const cursor = sp.get('cursor');

  const items: any[] = [];

  try {
    // Fetch products
    if (type === 'all' || type === 'product') {
      const productWhere: any = { isActive: true };
      if (category) productWhere.category = category;
      if (search) {
        productWhere.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const products = await prisma.product.findMany({
        where: productWhere,
        include: { user: { select: { name: true, username: true } } },
        take: limit,
        orderBy: sort === 'price_asc' ? { price: 'asc' } : sort === 'price_desc' ? { price: 'desc' } : { createdAt: 'desc' },
      });

      products.forEach((p) => {
        items.push({
          id: p.id,
          type: 'product',
          title: p.name,
          description: p.description,
          price: p.price,
          salePrice: p.salePrice,
          currency: 'MNT',
          category: p.category,
          emoji: p.emoji,
          images: p.images,
          rating: p.rating,
          reviewCount: p.reviewCount,
          sellerName: p.user?.name,
          sellerSlug: p.user?.username,
          stock: p.stock,
          commission: p.commission,
          createdAt: p.createdAt?.toISOString(),
        });
      });
    }

    // Fetch services
    if (type === 'all' || type === 'service') {
      const serviceWhere: any = { isActive: true };
      if (category) serviceWhere.category = category;
      if (search) {
        serviceWhere.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const services = await prisma.service.findMany({
        where: serviceWhere,
        include: { shop: { select: { name: true, slug: true } } },
        take: limit,
        orderBy: sort === 'price_asc' ? { price: 'asc' } : sort === 'price_desc' ? { price: 'desc' } : { createdAt: 'desc' },
      });

      services.forEach((s) => {
        items.push({
          id: s.id,
          type: 'service',
          title: s.name,
          description: s.description,
          price: s.price,
          currency: 'MNT',
          category: s.category,
          images: s.images,
          sellerName: s.shop?.name,
          sellerSlug: s.shop?.slug,
          duration: s.duration,
          createdAt: s.createdAt?.toISOString(),
        });
      });
    }
  } catch {
    // DB not available — return empty, frontend uses demo data fallback
  }

  // Sort merged results
  if (sort === 'newest') items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  else if (sort === 'price_asc') items.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
  else if (sort === 'price_desc') items.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));

  return json({
    items: items.slice(0, limit),
    total: items.length,
    hasMore: items.length >= limit,
  });
}


