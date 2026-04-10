import { prisma } from '@/lib/prisma';
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
    const [feedPosts, entities, products] = await Promise.all([
      prisma.feedPost.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          media: true,
          category: true,
          user: { select: { name: true } },
        },
      }),
      prisma.entity.findMany({
        where: { isActive: true, isApproved: true },
        orderBy: { rating: 'desc' },
        take: 6,
        include: { _count: { select: { products: true } } },
      }),
      prisma.product.findMany({
        where: { isActive: true, isOnSale: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { media: { take: 1 }, entity: true },
      }),
    ]);
    return { feedPosts, entities, products };
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
        {/* Hero Search */}
        <HeroSearch />

        {/* Trust Badges */}
        <TrustBadges />

        {/* Category Icons */}
        <CategoryIcons />

        {/* Feed Preview */}
        <FeedPreview posts={feedPosts} />

        {/* Sale Products */}
        <PromoSection products={products} />

        {/* Featured Shops */}
        <FeaturedShops entities={entities} />

        {/* Gold Banner */}
        <GoldPromoBanner />

        {/* Seller CTA */}
        <SellerSection />
      </main>

      <Footer />
      <MobileNav />
    </>
  );
}

function TrustBadges() {
  const badges = [
    { icon: '🚚', text: '50,000₮+ үнэгүй хүргэлт' },
    { icon: '🔄', text: '48 цагийн буцаалт' },
    { icon: '🔒', text: 'QPay аюулгүй төлбөр' },
    { icon: '⭐', text: 'Баталгаат бараа' },
  ];

  return (
    <div className="bg-[var(--esl-bg-card)] border-y border-[var(--esl-border)]">
      <div className="max-w-[1200px] mx-auto px-4 py-3 flex justify-around flex-wrap gap-2">
        {badges.map((b, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5">
            <span className="text-xl">{b.icon}</span>
            <span className="text-[var(--esl-text-muted)] text-[13px] font-medium">{b.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
