import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  // Counts
  console.log('User:', await prisma.user.count());
  console.log('Product:', await prisma.product.count());
  console.log('Order:', await prisma.order.count());
  console.log('Shop:', await prisma.shop.count());
  console.log('Wallet:', await prisma.wallet.count());

  // Sellers with store info
  const sellers = await prisma.user.findMany({
    where: { role: 'seller' },
    select: { name: true, email: true, store: true },
    take: 3,
  });
  console.log('\nSellers:', JSON.stringify(sellers, null, 2));

  // Sample product
  const prod = await prisma.product.findFirst({
    select: { name: true, price: true, userId: true, images: true },
  });
  console.log('\nProduct:', JSON.stringify(prod, null, 2));

  // Raw stores count
  const storesCount = await prisma.$runCommandRaw({ count: 'stores' }) as any;
  console.log('\nRaw stores collection:', storesCount.n);

  await prisma.$disconnect();
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
