'use client';
import { useRouter } from 'next/navigation';
import {
  Shirt,
  Smartphone,
  Sparkles,
  Home,
  UtensilsCrossed,
  Car,
  Dumbbell,
  Baby,
  Building2,
  Wrench,
  HardHat,
  Monitor,
  type LucideIcon,
} from 'lucide-react';

const CATS: { slug: string; icon: LucideIcon; name: string }[] = [
  { slug: 'fashion', icon: Shirt, name: 'Хувцас' },
  { slug: 'electronics', icon: Smartphone, name: 'Электроник' },
  { slug: 'beauty-health', icon: Sparkles, name: 'Гоо сайхан' },
  { slug: 'home-living', icon: Home, name: 'Гэр ахуй' },
  { slug: 'food-beverage', icon: UtensilsCrossed, name: 'Хоол' },
  { slug: 'auto-moto', icon: Car, name: 'Авто' },
  { slug: 'sports-travel', icon: Dumbbell, name: 'Спорт' },
  { slug: 'kids-toys', icon: Baby, name: 'Хүүхэд' },
  { slug: 'real-estate-feed', icon: Building2, name: 'Үл хөдлөх' },
  { slug: 'services-feed', icon: Wrench, name: 'Үйлчилгээ' },
  { slug: 'construction', icon: HardHat, name: 'Барилга' },
  { slug: 'digital-goods', icon: Monitor, name: 'Дижитал' },
];

export default function CategoryIcons() {
  const router = useRouter();

  return (
    <section className="max-w-[1200px] mx-auto px-4 py-8">
      <h2 className="text-[var(--esl-text)] text-xl font-bold mb-5">
        Ангилалаар хайх
      </h2>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-3">
        {CATS.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => router.push(`/store?category=${cat.slug}`)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[var(--esl-border)] bg-[var(--esl-bg-card)] hover:border-[#E8242C] hover:bg-[rgba(232,36,44,0.05)] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <cat.icon size={28} className="text-[var(--esl-text-muted)]" />
            <span className="text-[11px] font-medium text-[var(--esl-text-muted)] text-center">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
