import { prisma } from '@/lib/prisma';
import { Truck, RefreshCw, Lock, Star } from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import MobileNav from '@/components/shared/MobileNav';
import HeroSearch from '@/components/home/HeroSearch';
import CategoryIcons from '@/components/home/CategoryIcons';
import FeedPreview from '@/components/home/FeedPreview';
import PromoSection from '@/components/home/PromoSection';
import FeaturedShops from '@/components/home/FeaturedShops';
import GoldPromoBanner from '@/components/home/GoldPromoBanner';
import SellerSection from '@/components/home/SellerSection';

async function getHomeData() {
  try {
    const [feedPosts, shops, products] = await Promise.all([
      prisma.feedItem.findMany({
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { media: true },
      }),
      prisma.shop.findMany({
        where: { isBlocked: false },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      prisma.product.findMany({
        where: { isActive: true, salePrice: { not: null } },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

    // Map feedItems to expected format
    const mappedPosts = feedPosts.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      district: p.district,
      media: p.media,
      category: p.category ? { name: p.category } : null,
    }));

    // Map shops to expected format
    const mappedShops = shops.map((s) => ({
      id: s.id,
      name: s.name,
      logoUrl: s.logo,
      storefrontSlug: s.storefrontSlug || s.slug,
      rating: null,
      _count: { products: 0 },
    }));

    // Map products
    const mappedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.salePrice || p.price,
      media: p.images?.[0] ? [{ url: p.images[0] }] : [],
      entity: null,
    }));

    return { feedPosts: mappedPosts, entities: mappedShops, products: mappedProducts };
  } catch {
    return { feedPosts: [], entities: [], products: [] };
  }
}

export default async function HomePage() {
  const { feedPosts, entities, products } = await getHomeData();

  return (
    <>
      <Navbar />
      <main>
        <HeroSearch />
        <TrustBadges />
        <CategoryIcons />
        <FeedPreview posts={feedPosts} />
        <PromoSection products={products} />
        <FeaturedShops entities={entities} />
        <GoldPromoBanner />
        <SellerSection />
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}

function TrustBadges() {
  const badges = [
    { icon: <Truck className="w-5 h-5 text-[var(--esl-accent)]" />, text: '50,000₮+ үнэгүй хүргэлт' },
    { icon: <RefreshCw className="w-5 h-5 text-[var(--esl-accent)]" />, text: '48 цагийн буцаалт' },
    { icon: <Lock className="w-5 h-5 text-[var(--esl-accent)]" />, text: 'QPay аюулгүй төлбөр' },
    { icon: <Star className="w-5 h-5 text-[var(--esl-accent)]" />, text: 'Баталгаат бараа' },
  ];
  return (
    <div className="bg-[var(--esl-bg-card)] border-y border-[var(--esl-border)]">
      <div className="max-w-[1200px] mx-auto px-4 py-3 flex justify-around flex-wrap gap-2">
        {badges.map((b, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5">
            {b.icon}
            <span className="text-[var(--esl-text-muted)] text-[13px] font-medium">{b.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
