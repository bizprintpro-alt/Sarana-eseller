import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const isDryRun = process.argv.includes('--dry-run');

async function cleanDemoData() {
  console.log(`\n🧹 Demo data цэвэрлэх${isDryRun ? ' (DRY RUN — устгахгүй)' : ''}...\n`);

  // 1. Unsplash зурагтай бараа олох
  const unsplashProducts = await prisma.product.findMany({
    where: {
      images: { hasSome: ['unsplash.com'] },
    },
    select: { id: true, name: true, images: true },
  });

  // Filter: images array-д unsplash.com агуулсан
  const unsplashIds = unsplashProducts
    .filter(p => p.images.some(img => img.includes('unsplash.com')))
    .map(p => p.id);

  console.log(`📦 Unsplash зурагтай бараа: ${unsplashIds.length}`);
  if (unsplashIds.length > 0 && !isDryRun) {
    const result = await prisma.product.deleteMany({ where: { id: { in: unsplashIds } } });
    console.log(`   ✅ ${result.count} бараа устгагдлаа`);
  }

  // 2. isDemo=true бараа
  const demoProductCount = await prisma.product.count({ where: { isDemo: true } });
  console.log(`📦 isDemo=true бараа: ${demoProductCount}`);
  if (demoProductCount > 0 && !isDryRun) {
    const result = await prisma.product.deleteMany({ where: { isDemo: true } });
    console.log(`   ✅ ${result.count} бараа устгагдлаа`);
  }

  // 3. isDemo=true дэлгүүр
  const demoShopCount = await prisma.shop.count({ where: { isDemo: true } });
  console.log(`🏪 isDemo=true дэлгүүр: ${demoShopCount}`);
  if (demoShopCount > 0 && !isDryRun) {
    const result = await prisma.shop.deleteMany({ where: { isDemo: true } });
    console.log(`   ✅ ${result.count} дэлгүүр устгагдлаа`);
  }

  // Summary
  const totalDeleted = unsplashIds.length + demoProductCount + demoShopCount;
  console.log(`\n📊 Нийт: ${totalDeleted} зүйл${isDryRun ? ' олдлоо (устгаагүй)' : ' устгагдлаа'}`);

  if (isDryRun) {
    console.log('\n💡 Бодитоор устгахын тулд --dry-run flag-гүй ажиллуулна уу:');
    console.log('   npm run clean:demo\n');
  }

  await prisma.$disconnect();
}

cleanDemoData().catch(e => {
  console.error('Алдаа:', e);
  prisma.$disconnect();
  process.exit(1);
});
