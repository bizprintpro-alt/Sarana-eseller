import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('User:', await prisma.user.count());
  console.log('Product:', await prisma.product.count());
  console.log('Order:', await prisma.order.count());
  console.log('Wallet:', await prisma.wallet.count());

  const products = await prisma.product.findMany({
    select: { name: true, price: true, category: true },
    take: 5,
  });
  console.log('\nSample products:');
  products.forEach(p => console.log(`  ${p.name} — ${p.price}₮ (${p.category})`));

  await prisma.$disconnect();
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
