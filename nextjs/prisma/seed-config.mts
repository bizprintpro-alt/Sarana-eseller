import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Platform configs
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
    console.log(`✓ Config: ${c.key} = ${c.value}`);
  }

  // Give all existing shops a free subscription
  const shops = await prisma.shop.findMany({ select: { id: true } });
  for (const shop of shops) {
    await prisma.shopSubscription.upsert({
      where: { shopId: shop.id },
      update: {},
      create: { shopId: shop.id, planKey: 'free', status: 'active' },
    });
  }
  console.log(`✓ ${shops.length} shops given free subscription`);
}

main()
  .then(() => { console.log('✅ Seed complete'); process.exit(0); })
  .catch((e) => { console.error(e); process.exit(1); });
