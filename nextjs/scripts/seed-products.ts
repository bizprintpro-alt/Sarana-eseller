import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

const PRODUCTS = [
  { name: 'Premium цагаан цамц', price: 35000, category: 'Хувцас', emoji: '👕', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'], stock: 50, rating: 4.8, reviewCount: 24 },
  { name: 'Sporty гутал Air', price: 69000, salePrice: 89000, category: 'Хувцас', emoji: '👟', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'], stock: 30, rating: 4.9, reviewCount: 58 },
  { name: 'Designer малгай', price: 22000, salePrice: 28000, category: 'Хувцас', emoji: '🧢', images: ['https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400'], stock: 45, rating: 4.7, reviewCount: 12 },
  { name: 'Leather цүнх', price: 75000, salePrice: 95000, category: 'Хувцас', emoji: '👜', images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400'], stock: 15, rating: 4.6, reviewCount: 31 },
  { name: 'Пицца Маргарита', price: 38000, category: 'Хоол хүнс', emoji: '🍕', images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'], stock: 100, rating: 4.9, reviewCount: 142 },
  { name: 'Burger Double set', price: 35000, salePrice: 42000, category: 'Хоол хүнс', emoji: '🍔', images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'], stock: 80, rating: 4.8, reviewCount: 88 },
  { name: 'iPhone 15 Pro case', price: 18000, category: 'Электроник', emoji: '📱', images: ['https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400'], stock: 200, rating: 4.5, reviewCount: 97 },
  { name: 'Bluetooth чихэвч', price: 99000, salePrice: 125000, category: 'Электроник', emoji: '🎧', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'], stock: 25, rating: 4.7, reviewCount: 43 },
  { name: 'Нүүрний крем SPF50', price: 28000, category: 'Гоо сайхан', emoji: '🧴', images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400'], stock: 60, rating: 4.8, reviewCount: 207 },
  { name: 'Гоо сайхны багц', price: 52000, salePrice: 65000, category: 'Гоо сайхан', emoji: '✨', images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'], stock: 40, rating: 4.6, reviewCount: 78 },
  { name: 'Гэрийн ургамал', price: 15000, category: 'Гэр ахуй', emoji: '🌿', images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400'], stock: 35, rating: 4.4, reviewCount: 34 },
  { name: 'Yoga mat pro', price: 44000, salePrice: 55000, category: 'Спорт', emoji: '🧘', images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400'], stock: 20, rating: 4.9, reviewCount: 55 },
  { name: 'Ажлын ширээ', price: 185000, category: 'Гэр ахуй', emoji: '🪑', images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400'], stock: 10, rating: 4.7, reviewCount: 19 },
  { name: 'Ном: Монгол түүх', price: 25000, category: 'Бусад', emoji: '📚', images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'], stock: 100, rating: 4.5, reviewCount: 67 },
  { name: 'Гар бөмбөг', price: 32000, category: 'Спорт', emoji: '⚽', images: ['https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=400'], stock: 40, rating: 4.6, reviewCount: 29 },
  { name: 'Wireless mouse', price: 45000, category: 'Электроник', emoji: '🖱️', images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'], stock: 55, rating: 4.4, reviewCount: 82 },
  { name: 'Ариутгал шингэн', price: 8500, category: 'Гэр ахуй', emoji: '🧹', images: ['https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400'], stock: 150, rating: 4.3, reviewCount: 45 },
  { name: 'Хуурай жимс багц', price: 19000, category: 'Хоол хүнс', emoji: '🥜', images: ['https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400'], stock: 70, rating: 4.7, reviewCount: 113 },
  { name: 'Нарны шил', price: 55000, salePrice: 72000, category: 'Хувцас', emoji: '🕶️', images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400'], stock: 25, rating: 4.5, reviewCount: 36 },
  { name: 'Smart watch', price: 129000, salePrice: 159000, category: 'Электроник', emoji: '⌚', images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'], stock: 18, rating: 4.8, reviewCount: 156 },
];

async function main() {
  // Clear old products
  const deleted = await prisma.product.deleteMany({});
  console.log(`Deleted ${deleted.count} old products`);

  // Insert new products
  for (const p of PRODUCTS) {
    await prisma.product.create({
      data: {
        name: p.name,
        price: p.price,
        salePrice: p.salePrice || null,
        category: p.category,
        emoji: p.emoji,
        images: p.images,
        stock: p.stock || 0,
        rating: p.rating || null,
        reviewCount: p.reviewCount || 0,
        isActive: true,
      },
    });
  }

  console.log(`✅ ${PRODUCTS.length} products seeded`);

  const count = await prisma.product.count();
  console.log(`Total products in DB: ${count}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
