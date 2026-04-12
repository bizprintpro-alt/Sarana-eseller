import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const nullUsers = await prisma.user.findMany({ where: { username: null } });
  console.log(`Null username users: ${nullUsers.length}`);

  for (const u of nullUsers) {
    const username = 'user-' + u.id.slice(-8);
    await prisma.user.update({ where: { id: u.id }, data: { username } });
    console.log(`  Updated: ${u.email} → ${username}`);
  }

  console.log('Done');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
