import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
async function main() {
  const u = await prisma.user.findFirst({ select: { email: true, password: true } });
  console.log(u?.email, '→', u?.password?.substring(0, 25) + '...');
  await prisma.$disconnect();
}
main().catch(e => console.error(e.message));
