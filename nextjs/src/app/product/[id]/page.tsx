import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductDetailClient from '@/components/product/ProductDetailClient';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isValidObjectId(id)) return { title: 'Олдсонгүй' };
  let product;
  try {
    product = await prisma.product.findUnique({ where: { id }, select: { name: true, description: true, images: true } });
  } catch { return { title: 'Олдсонгүй' }; }
  if (!product) return { title: 'Олдсонгүй' };
  return {
    title: `${product.name} — eseller.mn`,
    description: product.description?.slice(0, 160) || product.name,
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160) || product.name,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();

  let product;
  try {
    product = await prisma.product.findUnique({
      where: { id },
      include: {
        categoryRef: true,
        user: { select: { name: true, id: true, username: true } },
      },
    });
  } catch { notFound(); }

  if (!product) notFound();

  // Fetch entity media
  const media = await prisma.entityMedia.findMany({
    where: { productId: id },
    orderBy: { sortOrder: 'asc' },
  });

  // Fetch related products (same category, max 4)
  const related = product.categoryId
    ? await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: id },
          isActive: true,
        },
        take: 4,
        orderBy: { createdAt: 'desc' },
      })
    : [];

  // Transform to client-compatible shape
  const clientProduct = {
    ...product,
    _id: product.id,
    media: media.map(m => ({
      id: m.id,
      type: m.type as 'IMAGE' | 'VIDEO' | 'VIRTUAL_TOUR' | 'FLOOR_PLAN',
      url: m.url,
      thumbnail: m.thumbnail,
      caption: m.caption,
      sortOrder: m.sortOrder,
    })),
    user: product.user ? { ...product.user, _id: product.user.id } : null,
  };

  const relatedProducts = related.map(r => ({
    ...r,
    _id: r.id,
  }));

  // Product JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.name,
    image: product.images?.[0] || undefined,
    offers: {
      '@type': 'Offer',
      price: product.salePrice || product.price,
      priceCurrency: 'MNT',
      availability: (product.stock ?? 0) > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `https://eseller.mn/product/${product.id}`,
    },
    ...(product.rating ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 1,
      },
    } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={clientProduct as any} relatedProducts={relatedProducts as any} />
    </>
  );
}
