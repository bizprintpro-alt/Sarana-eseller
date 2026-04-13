/**
 * Seed Enterprise Demo Data
 * Usage: npx tsx scripts/seed-enterprise-demo.ts
 *
 * Creates demo enterprise shops with sample products
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

  // Find or create a demo user
  let user = await prisma.user.findFirst({ where: { email: 'demo@eseller.mn' } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Demo Enterprise',
        email: 'demo@eseller.mn',
        password: '$2b$10$demohashedpassword',
        role: 'seller',
      },
    });
  }

  // Create demo shop
  let shop = await prisma.shop.findFirst({ where: { slug: 'nomin-demo' } });
  if (!shop) {
    shop = await prisma.shop.create({
      data: {
        userId: user.id,
        name: 'Номин (Demo)',
        slug: 'nomin-demo',
        phone: '77001234',
        address: 'Улаанбаатар, СБД',
        industry: 'retail',
        isDemo: true,
      },
    });
  }

  // Create enterprise config
  const existing = await prisma.enterpriseShop.findFirst({ where: { shopId: shop.id } });
  if (!existing) {
    await prisma.enterpriseShop.create({
      data: {
        shopId: shop.id,
        subdomain: 'nomin-demo',
        primaryColor: '#003DA5',
        accentColor: '#E67E22',
        plan: 'CORPORATE',
      },
    });
  }

  // Create products
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
    }
  }

  console.log(`[SEED] Done! nomin-demo.eseller.mn ready with ${DEMO_PRODUCTS.length} products`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
