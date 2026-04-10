'use client';
import { useRouter } from 'next/navigation';

const CATS = [
  { slug: 'fashion', icon: '👗', name: 'Хувцас' },
  { slug: 'electronics', icon: '📱', name: 'Электроник' },
  { slug: 'beauty-health', icon: '💄', name: 'Гоо сайхан' },
  { slug: 'home-living', icon: '🏠', name: 'Гэр ахуй' },
  { slug: 'food-beverage', icon: '🍔', name: 'Хоол' },
  { slug: 'auto-moto', icon: '🚗', name: 'Авто' },
  { slug: 'sports-travel', icon: '🏀', name: 'Спорт' },
  { slug: 'kids-toys', icon: '🧸', name: 'Хүүхэд' },
  { slug: 'real-estate-feed', icon: '🏢', name: 'Үл хөдлөх' },
  { slug: 'services-feed', icon: '🔧', name: 'Үйлчилгээ' },
  { slug: 'construction', icon: '🏗', name: 'Барилга' },
  { slug: 'digital-goods', icon: '💻', name: 'Дижитал' },
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
            <span className="text-[28px]">{cat.icon}</span>
            <span className="text-[11px] font-medium text-[var(--esl-text-muted)] text-center">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
