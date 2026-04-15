/**
 * Smoke test: Wallet escrow flow.
 *
 * Requires a valid User with id matching testBuyer/testSeller (MongoDB
 * ObjectId). Because of the User FK on Wallet, we create test User rows
 * up front, then tear everything down at the end.
 *
 * Run: npx tsx scripts/test-wallet-escrow.ts
 */
import { prisma } from '../src/lib/prisma';
import { holdForEscrow, releaseEscrow, refundEscrow } from '../src/lib/wallet-escrow';

async function run() {
  let passed = 0;
  let failed = 0;

  function check(label: string, condition: boolean) {
    if (condition) {
      console.log(`  ✅ ${label}`);
      passed++;
    } else {
      console.log(`  ❌ ${label}`);
      failed++;
    }
  }

  console.log('\neseller.mn — Wallet escrow smoke test');
  console.log('══════════════════════════════════════');

  // Create throwaway users so FK is satisfied
  const stamp = Date.now();
  const buyer = await prisma.user.create({
    data: {
      name: `test-buyer-${stamp}`,
      email: `test-buyer-${stamp}@example.test`,
      password: 'x',
    },
  });
  const seller = await prisma.user.create({
    data: {
      name: `test-seller-${stamp}`,
      email: `test-seller-${stamp}@example.test`,
      password: 'x',
    },
  });

  try {
    // Setup
    await prisma.wallet.create({
      data: { userId: buyer.id, balance: 100000, pending: 0, escrowHold: 0, history: [] },
    });

    // 1. Hold
    await holdForEscrow(buyer.id, 'ORD-001', 50000);
    const w1 = await prisma.wallet.findUnique({ where: { userId: buyer.id } });
    check('Hold: balance 50K', w1?.balance === 50000);
    check('Hold: escrow 50K', w1?.escrowHold === 50000);
    check('Hold: history entry', Array.isArray(w1?.history) && (w1!.history as unknown[]).length >= 1);

    // 2. Release
    await releaseEscrow('ORD-001', buyer.id, seller.id, 50000, 2500);
    const w2Buyer = await prisma.wallet.findUnique({ where: { userId: buyer.id } });
    const w2Seller = await prisma.wallet.findUnique({ where: { userId: seller.id } });
    check('Release: buyer escrow 0', w2Buyer?.escrowHold === 0);
    check('Release: seller balance 47.5K', w2Seller?.balance === 47500);

    // 3. New hold → refund
    await prisma.wallet.update({
      where: { userId: buyer.id },
      data: { balance: 30000 },
    });
    await holdForEscrow(buyer.id, 'ORD-002', 30000);
    await refundEscrow('ORD-002', buyer.id, 30000);
    const w3 = await prisma.wallet.findUnique({ where: { userId: buyer.id } });
    check('Refund: balance 30K', w3?.balance === 30000);
    check('Refund: escrow 0', w3?.escrowHold === 0);

    // 4. History entries
    const entries = (w3?.history as unknown as unknown[] | null)?.length ?? 0;
    check(`History: ${entries} entries (>=4 expected)`, entries >= 4);
  } finally {
    // Cleanup
    await prisma.wallet.deleteMany({ where: { userId: { in: [buyer.id, seller.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [buyer.id, seller.id] } } });
  }

  console.log('══════════════════════════════════════');
  console.log(`✅ ${passed} passed  ❌ ${failed} failed\n`);

  await prisma.$disconnect();
  if (failed > 0) process.exit(1);
}

run().catch(async (e) => {
  console.error('Fatal:', e);
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});
