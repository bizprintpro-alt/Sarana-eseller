import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
async function main() {
  const products = await prisma.product.findMany({ take: 5, select: { name: true, images: true } });
  products.forEach(p => console.log(p.name, '→', JSON.stringify(p.images)));
  await prisma.$disconnect();
}
main().catch(e => console.error(e.message));
