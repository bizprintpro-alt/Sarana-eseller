/**
 * Delete shops/entities created during testing.
 * Usage: npx tsx scripts/cleanup-test-shops.ts
 *
 * Dry-run by default — set EXECUTE=1 to actually delete.
 */
import { prisma } from '../src/lib/prisma';

const EXECUTE = process.env.EXECUTE === '1';

// Test patterns:
// - slug starts with "test-"
// - name contains "test" (case-insensitive)
// - obvious junk like "mmm", "aaa", "toogii-N" duplicates
const JUNK_NAMES = ['mstore', 'mmmmm', 'aaa', 'bbb', 'ccc', 'ddd'];

async function main() {
  console.log(`Mode: ${EXECUTE ? '🔥 EXECUTE' : '🧪 DRY-RUN (set EXECUTE=1 to delete)'}`);

  // Collect candidates
  const shops = await prisma.shop.findMany({
    where: {
      OR: [
        { slug: { startsWith: 'test-' } },
        { name: { contains: 'test', mode: 'insensitive' } },
        { name: { in: JUNK_NAMES } },
      ],
    },
    select: { id: true, name: true, slug: true, userId: true },
  });

  console.log(`\n📋 Shops to delete (${shops.length}):`);
  for (const s of shops) {
    console.log(`  - ${s.slug.padEnd(40)} ${s.name}  [user: ${s.userId.slice(-6)}]`);
  }

  if (shops.length === 0) {
    console.log('\n✅ Nothing to clean.');
    return;
  }

  if (!EXECUTE) {
    console.log('\n⚠️  DRY-RUN. Re-run with EXECUTE=1 to actually delete.');
    return;
  }

  // Delete
  const ids = shops.map((s) => s.id);
  await prisma.shop.deleteMany({ where: { id: { in: ids } } });
  console.log(`\n🗑️  Deleted ${ids.length} shops.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
