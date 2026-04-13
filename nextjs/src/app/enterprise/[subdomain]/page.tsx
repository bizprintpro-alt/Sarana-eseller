import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ subdomain: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain } = await params;
  const enterprise = await prisma.enterpriseShop.findUnique({
    where: { subdomain },
    include: { shop: { select: { name: true } } },
  });
  if (!enterprise) return { title: 'Олдсонгүй' };
  return {
    title: `${enterprise.shop.name} | eseller.mn`,
    icons: enterprise.faviconUrl ? [{ url: enterprise.faviconUrl }] : undefined,
  };
}

export default async function EnterpriseStorePage({ params }: Props) {
  const { subdomain } = await params;

  const enterprise = await prisma.enterpriseShop.findUnique({
    where: { subdomain },
    include: {
      shop: {
        select: {
          id: true,
          name: true,
          logo: true,
          phone: true,
          address: true,
          slug: true,
        },
      },
    },
  });

  if (!enterprise || !enterprise.isActive) notFound();

  // Get products for this shop
  const products = await prisma.product.findMany({
    where: { userId: undefined }, // We need shopId; products linked via user
    take: 24,
    orderBy: { createdAt: 'desc' },
  });

  // Get products via shop owner
  const shopOwner = await prisma.shop.findUnique({
    where: { id: enterprise.shopId },
    select: { userId: true },
  });

  const shopProducts = shopOwner
    ? await prisma.product.findMany({
        where: { userId: shopOwner.userId, isActive: true },
        take: 24,
        orderBy: { createdAt: 'desc' },
      })
    : [];

  const primary = enterprise.primaryColor;
  const accent = enterprise.accentColor;

  return (
    <div>
      {/* Branded Header */}
      <header
        className="sticky top-0 z-50"
        style={{ background: primary }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(enterprise.logoUrl || enterprise.shop.logo) && (
              <img
                src={enterprise.logoUrl || enterprise.shop.logo || ''}
                alt={enterprise.shop.name}
                className="h-10 w-auto rounded"
              />
            )}
            <span className="text-white text-xl font-bold">{enterprise.shop.name}</span>
          </div>
          <div className="flex items-center gap-4">
            {enterprise.shop.phone && (
              <a href={`tel:${enterprise.shop.phone}`} className="text-white/80 text-sm hover:text-white">
                {enterprise.shop.phone}
              </a>
            )}
            <Link href="/cart" className="text-white/80 hover:text-white text-sm font-medium">
              Сагс
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div
        className="py-16 text-center"
        style={{ background: `linear-gradient(135deg, ${primary}, ${primary}dd)` }}
      >
        <h1 className="text-4xl font-extrabold text-white mb-3">{enterprise.shop.name}</h1>
        {enterprise.shop.address && (
          <p className="text-white/70">{enterprise.shop.address}</p>
        )}
      </div>

      {/* Product Grid */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-6">Бүтээгдэхүүн</h2>
        {shopProducts.length === 0 ? (
          <p className="text-gray-500 text-center py-12">Бараа байхгүй байна</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {shopProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition group no-underline"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {product.emoji || '📦'}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-base font-bold" style={{ color: accent }}>
                      {(product.salePrice || product.price).toLocaleString()}₮
                    </span>
                    {product.salePrice && product.salePrice < product.price && (
                      <span className="text-xs text-gray-400 line-through">
                        {product.price.toLocaleString()}₮
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-gray-500">
        <p>{enterprise.shop.name} — eseller.mn дээр ажилладаг</p>
      </footer>
    </div>
  );
}
