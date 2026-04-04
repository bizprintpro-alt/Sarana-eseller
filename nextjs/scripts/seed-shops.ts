import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

const SHOPS = [
  {
    seller: { name: 'Sarana Fashion', email: 'sarana@eseller.mn', password: 'password123' },
    shop: { name: 'Sarana Fashion', slug: 'sarana-fashion', industry: 'Хувцас', phone: '9911-2233', district: 'ХУД' },
    products: [
      { name: 'Premium цагаан цамц', price: 35000, category: 'Хувцас', emoji: '👕', images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'], stock: 50, rating: 4.8, reviewCount: 24 },
      { name: 'Sporty гутал Air', price: 69000, salePrice: 89000, category: 'Хувцас', emoji: '👟', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'], stock: 30, rating: 4.9, reviewCount: 58 },
      { name: 'Designer малгай', price: 22000, salePrice: 28000, category: 'Хувцас', emoji: '🧢', images: ['https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400'], stock: 45, rating: 4.7, reviewCount: 12 },
      { name: 'Leather цүнх', price: 75000, salePrice: 95000, category: 'Хувцас', emoji: '👜', images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400'], stock: 15, rating: 4.6, reviewCount: 31 },
      { name: 'Нарны шил', price: 55000, salePrice: 72000, category: 'Хувцас', emoji: '🕶️', images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400'], stock: 25, rating: 4.5, reviewCount: 36 },
    ],
  },
  {
    seller: { name: 'TechUB Store', email: 'techub@eseller.mn', password: 'password123' },
    shop: { name: 'TechUB Store', slug: 'techub', industry: 'Электроник', phone: '8800-1122', district: 'СБД' },
    products: [
      { name: 'iPhone 15 Pro case', price: 18000, category: 'Электроник', emoji: '📱', images: ['https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400'], stock: 200, rating: 4.5, reviewCount: 97 },
      { name: 'Bluetooth чихэвч', price: 99000, salePrice: 125000, category: 'Электроник', emoji: '🎧', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'], stock: 25, rating: 4.7, reviewCount: 43 },
      { name: 'Smart watch', price: 129000, salePrice: 159000, category: 'Электроник', emoji: '⌚', images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'], stock: 18, rating: 4.8, reviewCount: 156 },
      { name: 'Wireless mouse', price: 45000, category: 'Электроник', emoji: '🖱️', images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'], stock: 55, rating: 4.4, reviewCount: 82 },
      { name: 'USB-C кабель 2м', price: 12000, category: 'Электроник', emoji: '🔌', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400'], stock: 300, rating: 4.3, reviewCount: 210 },
    ],
  },
  {
    seller: { name: 'PizzaMN', email: 'pizza@eseller.mn', password: 'password123' },
    shop: { name: 'PizzaMN', slug: 'pizzamn', industry: 'Хоол хүнс', phone: '7700-8899', district: 'БЗД' },
    products: [
      { name: 'Пицца Маргарита', price: 38000, category: 'Хоол хүнс', emoji: '🍕', images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'], stock: 100, rating: 4.9, reviewCount: 142 },
      { name: 'Burger Double set', price: 35000, salePrice: 42000, category: 'Хоол хүнс', emoji: '🍔', images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'], stock: 80, rating: 4.8, reviewCount: 88 },
      { name: 'Хуурай жимс багц', price: 19000, category: 'Хоол хүнс', emoji: '🥜', images: ['https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400'], stock: 70, rating: 4.7, reviewCount: 113 },
      { name: 'Органик цай багц', price: 24000, category: 'Хоол хүнс', emoji: '🍵', images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'], stock: 45, rating: 4.6, reviewCount: 67 },
      { name: 'Протейн бар 12ш', price: 42000, category: 'Хоол хүнс', emoji: '💪', images: ['https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=400'], stock: 60, rating: 4.5, reviewCount: 34 },
    ],
  },
  {
    seller: { name: 'BeautyMN', email: 'beauty@eseller.mn', password: 'password123' },
    shop: { name: 'BeautyMN', slug: 'beautymn', industry: 'Гоо сайхан', phone: '9900-5566', district: 'ЧД' },
    products: [
      { name: 'Нүүрний крем SPF50', price: 28000, category: 'Гоо сайхан', emoji: '🧴', images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400'], stock: 60, rating: 4.8, reviewCount: 207 },
      { name: 'Гоо сайхны багц', price: 52000, salePrice: 65000, category: 'Гоо сайхан', emoji: '✨', images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'], stock: 40, rating: 4.6, reviewCount: 78 },
      { name: 'Уруулын будаг сет', price: 35000, category: 'Гоо сайхан', emoji: '💄', images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400'], stock: 50, rating: 4.7, reviewCount: 92 },
      { name: 'Арьс арчилгааны сет', price: 68000, salePrice: 85000, category: 'Гоо сайхан', emoji: '🫧', images: ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400'], stock: 30, rating: 4.9, reviewCount: 145 },
      { name: 'Хүүхдийн шампунь', price: 15000, category: 'Гоо сайхан', emoji: '🧴', images: ['https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400'], stock: 80, rating: 4.4, reviewCount: 56 },
    ],
  },
  {
    seller: { name: 'GreenHome', email: 'green@eseller.mn', password: 'password123' },
    shop: { name: 'GreenHome', slug: 'greenhome', industry: 'Гэр ахуй', phone: '8811-3344', district: 'СХД' },
    products: [
      { name: 'Гэрийн ургамал', price: 15000, category: 'Гэр ахуй', emoji: '🌿', images: ['https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400'], stock: 35, rating: 4.4, reviewCount: 34 },
      { name: 'Ажлын ширээ', price: 185000, category: 'Гэр ахуй', emoji: '🪑', images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400'], stock: 10, rating: 4.7, reviewCount: 19 },
      { name: 'Ариутгал шингэн', price: 8500, category: 'Гэр ахуй', emoji: '🧹', images: ['https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400'], stock: 150, rating: 4.3, reviewCount: 45 },
      { name: 'LED ширээний гэрэл', price: 32000, category: 'Гэр ахуй', emoji: '💡', images: ['https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400'], stock: 40, rating: 4.6, reviewCount: 28 },
      { name: 'Yoga mat pro', price: 44000, salePrice: 55000, category: 'Спорт', emoji: '🧘', images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400'], stock: 20, rating: 4.9, reviewCount: 55 },
    ],
  },
];

async function main() {
  // Create admin user
  const hashedPw = await bcrypt.hash('password', 10);
  const adminExists = await prisma.user.findUnique({ where: { email: 'admin@eseller.mn' } });
  if (!adminExists) {
    await prisma.user.create({
      data: { name: 'Admin', email: 'admin@eseller.mn', password: hashedPw, role: 'admin' },
    });
    console.log('✓ Admin user created: admin@eseller.mn / password');
  } else {
    console.log('✓ Admin already exists');
  }

  // Clear old seeded products
  await prisma.product.deleteMany({});
  console.log('✓ Old products cleared');

  let totalProducts = 0;

  for (const shopData of SHOPS) {
    // Create or find seller user
    let seller = await prisma.user.findUnique({ where: { email: shopData.seller.email } });
    if (!seller) {
      seller = await prisma.user.create({
        data: {
          name: shopData.seller.name,
          email: shopData.seller.email,
          password: hashedPw,
          role: 'seller',
          store: { name: shopData.shop.name, commission: 15 },
        },
      });
      console.log(`✓ Seller: ${seller.name} (${seller.email})`);
    }

    // Create or update shop
    const shop = await prisma.shop.upsert({
      where: { userId: seller.id },
      update: { name: shopData.shop.name, industry: shopData.shop.industry },
      create: {
        userId: seller.id,
        name: shopData.shop.name,
        slug: shopData.shop.slug,
        industry: shopData.shop.industry,
        phone: shopData.shop.phone,
        district: shopData.shop.district,
        locationStatus: 'verified',
      },
    });
    console.log(`  ✓ Shop: ${shop.name} (${shop.slug})`);

    // Create products
    for (const p of shopData.products) {
      await prisma.product.create({
        data: {
          userId: seller.id,
          name: p.name,
          price: p.price,
          salePrice: p.salePrice || null,
          category: p.category,
          emoji: p.emoji,
          images: p.images,
          stock: p.stock,
          rating: p.rating,
          reviewCount: p.reviewCount,
          isActive: true,
        },
      });
      totalProducts++;
    }
    console.log(`  ✓ ${shopData.products.length} products added`);
  }

  // Create buyer user
  const buyerExists = await prisma.user.findUnique({ where: { email: 'buyer@eseller.mn' } });
  if (!buyerExists) {
    await prisma.user.create({
      data: { name: 'Болд', email: 'buyer@eseller.mn', password: hashedPw, role: 'buyer' },
    });
    console.log('✓ Buyer: buyer@eseller.mn / password');
  }

  // Seed platform config
  const configs = [
    { key: 'commission_rate', value: '5' },
    { key: 'affiliate_rate', value: '15' },
    { key: 'seller_registration', value: 'true' },
    { key: 'maintenance_mode', value: 'false' },
  ];
  for (const c of configs) {
    await prisma.platformConfig.upsert({
      where: { key: c.key },
      update: {},
      create: { ...c, updatedAt: new Date() },
    });
  }
  console.log('✓ Platform config seeded');

  // Give shops free subscriptions
  const shops = await prisma.shop.findMany({ select: { id: true } });
  for (const s of shops) {
    await prisma.shopSubscription.upsert({
      where: { shopId: s.id },
      update: {},
      create: { shopId: s.id, planKey: 'free', status: 'active' },
    });
  }
  console.log('✓ Shop subscriptions set to free');

  console.log(`\n✅ SEED COMPLETE: ${SHOPS.length} shops, ${totalProducts} products`);
  console.log('   Admin:  admin@eseller.mn / password');
  console.log('   Buyer:  buyer@eseller.mn / password');
  console.log('   Seller: sarana@eseller.mn / password');

  await prisma.$disconnect();
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
