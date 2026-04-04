import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  try {
    await prisma.$runCommandRaw({ dropIndexes: 'stores', index: 'referralCode_1' });
    console.log('✓ Dropped referralCode_1 index');
  } catch (e: any) {
    console.log('Drop result:', e.message?.substring(0, 100));
  }
  await prisma.$disconnect();
}
main();
