/**
 * Seed demo Live Streams — idempotent, skips if any LIVE/SCHEDULED stream exists.
 *
 * Run: npx tsx scripts/seed-live-streams.ts
 */
import { prisma } from '../src/lib/prisma';

async function main() {
  // Skip if any active/scheduled stream already exists
  const existing = await prisma.liveStream.count({
    where: { status: { in: ['LIVE', 'SCHEDULED'] } },
  });
  if (existing > 0) {
    console.log(`⏩ Алгасав — ${existing} идэвхтэй stream бий.`);
    return;
  }

  // Find a shop with its owner
  const shop = await prisma.shop.findFirst({
    include: { user: true },
  });
  if (!shop) {
    console.log('❌ Дэлгүүр байхгүй — эхлээд дэлгүүр үүсгэнэ үү.');
    return;
  }

  // Find published/active products
  const products = await prisma.product.findMany({
    where: { isActive: true },
    take: 3,
  });

  const demos = [
    {
      title: 'iPhone 15 Flash Sale — 20% хямдрал!',
      description: 'Live худалдан авалт хийж онцгой үнэ авах боломж',
      scope: 'PUBLIC',
      status: 'LIVE',
      embedType: 'YOUTUBE',
      youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
      viewerCount: 234,
      planRequired: 'BASIC',
      startedAt: new Date(),
    },
    {
      title: 'Өвлийн хувцас — шинэ цуглуулга',
      description: 'Энэ улиралын шилдэг хувцаснуудыг live-д харах',
      scope: 'PUBLIC',
      status: 'SCHEDULED',
      embedType: 'YOUTUBE',
      scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
      viewerCount: 0,
      planRequired: 'BASIC',
    },
    {
      title: 'Малчны органик бүтээгдэхүүн',
      description: 'Хөвсгөлийн малчнаас шууд live демо',
      scope: 'PUBLIC',
      status: 'LIVE',
      embedType: 'YOUTUBE',
      youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
      viewerCount: 89,
      planRequired: 'BASIC',
      startedAt: new Date(),
    },
  ];

  for (let i = 0; i < demos.length; i++) {
    const demo = demos[i];
    const stream = await prisma.liveStream.create({
      data: {
        ...demo,
        shopId: shop.id,
        hostId: shop.userId,
      },
    });

    // Attach first product to LIVE streams and flag it
    const product = products[i];
    if (product && demo.status === 'LIVE') {
      await prisma.liveProduct.create({
        data: {
          streamId: stream.id,
          productId: product.id,
          flashPrice: Math.floor(product.price * 0.8),
          flashStock: 10,
          isPinned: true,
          order: 1,
        },
      });

      await prisma.product.update({
        where: { id: product.id },
        data: {
          isLive: true,
          currentLiveId: stream.id,
        },
      });
    }

    console.log(`✅ ${stream.title} (${stream.status})`);
  }

  console.log('\n🎉 Seed дууслаа → https://eseller.mn/live');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
