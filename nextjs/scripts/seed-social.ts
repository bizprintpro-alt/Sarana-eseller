import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

const POSTS = [
  { content: 'Гайхалтай бараа! Маш сайн чанар байна 🔥', productIdx: 0, userIdx: 0 },
  { content: 'Хурдан хүргэлт, баталгаат бараа. Зөвлөж байна 👍', productIdx: 1, userIdx: 1 },
  { content: 'Үнэ чанарын харьцаа маш сайн байна ✅', productIdx: 2, userIdx: 2 },
  { content: 'Найздаа бэлэг болгон авлаа, их баярлав 🎁', productIdx: 3, userIdx: 3 },
  { content: 'Давтан захиална, маш их таалагдлаа 💯', productIdx: 4, userIdx: 0 },
  { content: 'eseller.mn-д анх удаа захиалсан, гайхалтай! 🚀', productIdx: 5, userIdx: 1 },
];

async function main() {
  console.log('[SEED SOCIAL] Эхэлж байна...');

  const users = await prisma.user.findMany({
    take: 5,
    select: { id: true },
  });
  const products = await prisma.product.findMany({
    where: { isActive: true },
    take: 10,
    select: { id: true, images: true },
  });

  if (users.length === 0 || products.length === 0) {
    console.log('❌ Хэрэглэгч эсвэл бараа байхгүй. Эхлээд seed хийнэ үү.');
    return;
  }

  console.log(`[SEED] ${users.length} хэрэглэгч, ${products.length} бараа олдов`);

  let created = 0;
  for (const p of POSTS) {
    const user = users[p.userIdx % users.length];
    const product = products[p.productIdx % products.length];

    // Skip if duplicate (same user + content)
    const existing = await prisma.socialPost.findFirst({
      where: { userId: user.id, content: p.content },
    });
    if (existing) continue;

    // Generate unique like userIds
    const likeCount = Math.floor(Math.random() * 15) + 1;
    const likedUserIds = Array.from(
      new Set(
        Array.from({ length: likeCount }, (_, i) => users[i % users.length].id)
      )
    );

    await prisma.socialPost.create({
      data: {
        userId: user.id,
        content: p.content,
        images: product.images?.slice(0, 1) ?? [],
        products: {
          create: { productId: product.id },
        },
        likes: {
          create: likedUserIds.map((userId) => ({ userId })),
        },
      },
    });
    created++;
  }

  console.log(`✅ ${created} шинэ social post үүсгэлээ (${POSTS.length - created} аль хэдийн байсан)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
