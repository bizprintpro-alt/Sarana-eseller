/**
 * eseller.mn — First Seller Seed
 * Usage: npx tsx scripts/seed-first-seller.ts
 *
 * Creates a test seller with a shop and 3 products.
 * Safe to run multiple times — skips if already exists.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SELLER_EMAIL = 'seller@eseller.mn';
const SELLER_PASSWORD = 'Test1234!';
const SHOP_SLUG = 'test-shop';

async function main() {
  console.log('\n🌱 First seller seed эхэллээ...\n');

  // 1. Check if already exists
  const existing = await prisma.user.findUnique({ where: { email: SELLER_EMAIL } });
  if (existing) {
    console.log(`⏭  Seller аль хэдийн бий: ${SELLER_EMAIL}`);
    const shop = await prisma.shop.findFirst({ where: { userId: existing.id } });
    if (shop) {
      const productCount = await prisma.product.count({ where: { userId: existing.id } });
      console.log(`   Дэлгүүр: ${shop.name} (/u/${shop.slug})`);
      console.log(`   Бараа: ${productCount} ширхэг`);
    }
    await prisma.$disconnect();
    return;
  }

  // 2. Create seller user
  const hashed = await bcrypt.hash(SELLER_PASSWORD, 12);
  const user = await prisma.user.create({
    data: {
      name: 'Тест Борлуулагч',
      email: SELLER_EMAIL,
      password: hashed,
      role: 'seller',
      entityType: 'store',
      phone: '99001122',
    },
  });
  console.log(`✅ Seller user үүслээ: ${user.email} (id: ${user.id})`);

  // 3. Create shop
  const shop = await prisma.shop.create({
    data: {
      userId: user.id,
      name: 'Туршилтын Дэлгүүр',
      slug: SHOP_SLUG,
      phone: '99001122',
      address: 'Улаанбаатар, СБД',
      district: 'СБД',
      industry: 'general',
      locationStatus: 'verified',
      isDemo: false,
    },
  });
  console.log(`✅ Дэлгүүр үүслээ: ${shop.name} → /u/${shop.slug}`);

  // 4. Create 3 products
  const products = [
    { name: 'Хүүхдийн ном багц', price: 25000, description: '5 номын багц, 3-7 нас', category: 'books-education', stock: 50 },
    { name: 'Гэрийн тавилга сандал', price: 89000, salePrice: 75000, description: 'Модон сандал, Монгол үйлдвэрлэл', category: 'home-living', stock: 20 },
    { name: 'Спорт цүнх', price: 45000, description: 'Усанд тэсвэртэй, 30л багтаамж', category: 'sports-travel', stock: 100 },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: {
        userId: user.id,
        name: p.name,
        price: p.price,
        salePrice: p.salePrice,
        description: p.description,
        category: p.category,
        stock: p.stock,
        images: [],
        isActive: true,
        isDemo: false,
        allowAffiliate: true,
        affiliateCommission: 10,
      },
    });
  }
  console.log(`✅ ${products.length} бараа нэмэгдлээ`);

  // 5. Verify
  console.log('\n── Шалгалт ──');

  const stats = await Promise.all([
    prisma.product.count({ where: { isActive: true, isDemo: false } }),
    prisma.shop.count({ where: { isBlocked: false, isDemo: false } }),
  ]);
  console.log(`   /api/stats: products=${stats[0]} shops=${stats[1]}`);
  console.log(`   /shops: дэлгүүр харагдах ёстой`);
  console.log(`   /u/${SHOP_SLUG}: профайл нээгдэх ёстой`);
  console.log(`   /store: ${products.length} бараа харагдах ёстой`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━');
  console.log('Pipeline ажиллаж байна — бодит seller бүртгүүлэхэд бэлэн!');
  console.log(`Нэвтрэх: ${SELLER_EMAIL} / ${SELLER_PASSWORD}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━\n');

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('❌ Алдаа:', e);
  prisma.$disconnect();
  process.exit(1);
});
