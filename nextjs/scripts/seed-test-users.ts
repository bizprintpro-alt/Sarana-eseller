import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

const TEST_USERS = [
  { name: 'Тест Худалдан авагч', phone: '99000001', email: 'buyer@test.mn',  password: 'test1234', role: 'buyer' },
  { name: 'Тест Дэлгүүр Эзэн',   phone: '99000002', email: 'owner@test.mn',  password: 'test1234', role: 'seller' },
  { name: 'Тест Жолооч',          phone: '99000003', email: 'driver@test.mn', password: 'test1234', role: 'delivery' },
  { name: 'Тест Борлуулагч',      phone: '99000004', email: 'seller@test.mn', password: 'test1234', role: 'affiliate' },
];

async function main() {
  console.log('🌱 Test users seed эхэлж байна...\n');

  for (const u of TEST_USERS) {
    const hashed = await bcrypt.hash(u.password, 10);

    // Check existing by email (@unique)
    const existing = await prisma.user.findFirst({
      where: { email: u.email },
      select: { id: true },
    });

    let user;
    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: { name: u.name, phone: u.phone, password: hashed, role: u.role },
        select: { id: true, email: true, role: true, phone: true },
      });
    } else {
      user = await prisma.user.create({
        data: {
          name: u.name,
          phone: u.phone,
          email: u.email,
          password: hashed,
          role: u.role,
          username: u.email.split('@')[0],
        },
        select: { id: true, email: true, role: true, phone: true },
      });
    }

    // Wallet upsert (ignore if exists)
    try {
      await prisma.wallet.create({
        data: { userId: user.id, balance: 50000 },
      });
    } catch {}

    // Auto-create shop for seller role
    if (u.role === 'seller') {
      const existingShop = await prisma.shop.findUnique({ where: { userId: user.id } });
      if (!existingShop) {
        const slug = `test-shop-${u.phone}`;
        await prisma.shop.create({
          data: {
            userId: user.id,
            name: 'Тест Дэлгүүр',
            slug,
            storefrontSlug: slug,
            phone: u.phone,
            industry: 'general',
          },
        });
      }
    }

    console.log(`✅ ${u.role.padEnd(10)} | ${u.phone} | ${u.password}`);
  }

  console.log('\n📱 Тест нэвтрэлтийн мэдээлэл:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  TEST_USERS.forEach((u) => {
    console.log(`${u.role.padEnd(10)} | ${u.phone} | ${u.password}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
