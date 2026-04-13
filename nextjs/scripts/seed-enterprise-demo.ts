/**
 * Seed Enterprise Demo Data
 * Usage: npx tsx scripts/seed-enterprise-demo.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_PRODUCTS = [
  { name: 'Samsung Galaxy S24 Ultra', price: 4200000, category: 'electronics', emoji: '📱' },
  { name: 'iPhone 15 Pro Max', price: 5500000, category: 'electronics', emoji: '📱' },
  { name: 'AirPods Pro 2', price: 890000, category: 'electronics', emoji: '🎧' },
  { name: 'MacBook Air M3', price: 4800000, category: 'electronics', emoji: '💻' },
  { name: 'Sony WH-1000XM5', price: 1200000, category: 'electronics', emoji: '🎧' },
  { name: 'iPad Air 5', price: 2800000, category: 'electronics', emoji: '📱' },
  { name: 'Nike Air Max 270', price: 450000, category: 'fashion', emoji: '👟' },
  { name: 'Adidas Ultraboost', price: 520000, category: 'fashion', emoji: '👟' },
  { name: 'Levi\'s 501 Original', price: 320000, category: 'fashion', emoji: '👖' },
  { name: 'Uniqlo Heattech', price: 89000, category: 'fashion', emoji: '👕' },
  { name: 'Dyson V15 Detect', price: 2800000, category: 'home', emoji: '🏠' },
  { name: 'Instant Pot Duo 7-in-1', price: 450000, category: 'home', emoji: '🍳' },
  { name: 'Philips Hue Starter Kit', price: 350000, category: 'home', emoji: '💡' },
  { name: 'Roomba j7+', price: 3200000, category: 'home', emoji: '🤖' },
  { name: 'Samsung 65" QLED TV', price: 4500000, category: 'electronics', emoji: '📺' },
];

async function main() {
  console.log('[SEED] Creating enterprise demo data...');

  // 1. Upsert demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@eseller.mn' },
    update: {},
    create: {
      name: 'Номин Дэлгүүр',
      email: 'demo@eseller.mn',
      password: '$2b$10$demohashedpassword',
      role: 'seller',
    },
  });
  console.log(`[SEED] User: ${user.id}`);

  // 2. Find or create demo shop
  let shop = await prisma.shop.findUnique({ where: { userId: user.id } });
  if (shop) {
    // Update existing shop slug to 'nomin'
    try {
      shop = await prisma.shop.update({
        where: { id: shop.id },
        data: { name: 'Номин Дэлгүүр', slug: 'nomin', storefrontSlug: 'nomin' },
      });
    } catch {
      // slug or storefrontSlug conflict — keep as-is
      console.log(`[SEED] Shop exists: ${shop.slug} (keeping existing slug)`);
    }
  } else {
    shop = await prisma.shop.create({
      data: {
        userId: user.id,
        name: 'Номин Дэлгүүр',
        slug: 'nomin',
        storefrontSlug: 'nomin',
        phone: '77001234',
        address: 'Улаанбаатар, СБД, 1-р хороо',
        industry: 'retail',
        isDemo: true,
      },
    });
  }
  console.log(`[SEED] Shop: ${shop.id} (slug: ${shop.slug})`);

  // 3. Upsert enterprise config
  const enterprise = await prisma.enterpriseShop.upsert({
    where: { subdomain: 'nomin' },
    update: {},
    create: {
      shopId: shop.id,
      subdomain: 'nomin',
      primaryColor: '#003DA5',
      accentColor: '#E67E22',
      plan: 'CORPORATE',
    },
  });
  console.log(`[SEED] Enterprise: ${enterprise.id} (subdomain: nomin)`);

  // 4. Upsert products
  let created = 0;
  for (const p of DEMO_PRODUCTS) {
    const exists = await prisma.product.findFirst({
      where: { name: p.name, userId: user.id },
    });
    if (!exists) {
      await prisma.product.create({
        data: {
          userId: user.id,
          name: p.name,
          price: p.price,
          category: p.category,
          emoji: p.emoji,
          isActive: true,
          isDemo: true,
          stock: Math.floor(10 + Math.random() * 90),
        },
      });
      created++;
    }
  }

  console.log(`[SEED] Products: ${created} created, ${DEMO_PRODUCTS.length - created} already existed`);
  console.log(`[SEED] Done! http://nomin.localhost:3000 ready`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
