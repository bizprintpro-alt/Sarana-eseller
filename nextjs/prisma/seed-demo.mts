import { PrismaClient } from '../src/generated/prisma/client'

const prisma = new PrismaClient()

const IMGS = {
  fashion: ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800','https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800'],
  food: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800','https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800','https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'],
  electronics: ['https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800','https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800'],
  beauty: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800','https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800','https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800'],
  furniture: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800','https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800','https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800'],
}

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@eseller.mn' },
    update: {},
    create: { email: 'admin@eseller.mn', name: 'Супер Админ', username: 'superadmin', password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', role: 'superadmin', phone: '99001122' },
  })
  console.log('✓ Superadmin: admin@eseller.mn / password')

  const shops = [
    { email: 'fashion@eseller.mn', name: 'Болд Гантулга', username: 'boldstore', shopName: 'Bold Fashion', slug: 'bold-fashion', cat: 'Хувцас', imgs: 'fashion' as const,
      products: [['Zara трэнд хүрэм',158000,190000],['H&M даашинз',45000,0],['Uniqlo цамц',35000,0],["Levi's жинс",120000,150000],['Nike гутал',180000,220000]] },
    { email: 'burger@eseller.mn', name: 'Энхбаяр Дорж', username: 'burgermn', shopName: 'BurgerMN', slug: 'burger-mn', cat: 'Хоол', imgs: 'food' as const,
      products: [['Burger Double Set',35000,42000],['Classic Burger',25000,0],['Chicken Burger',28000,0],['Pizza Margarita',38000,45000],['French Fries',12000,0]] },
    { email: 'tech@eseller.mn', name: 'Номун Батболд', username: 'techstore', shopName: 'TechHub MN', slug: 'techhub-mn', cat: 'Электроник', imgs: 'electronics' as const,
      products: [['iPhone 15 Pro',2800000,0],['Samsung S24',2200000,2500000],['MacBook Air M2',3500000,0],['AirPods Pro',650000,800000],['iPad Air',1800000,0]] },
    { email: 'beauty@eseller.mn', name: 'Оюунцэцэг Дашдорж', username: 'beautyshop', shopName: 'Beauty Plaza', slug: 'beauty-plaza', cat: 'Гоо сайхан', imgs: 'beauty' as const,
      products: [['Chanel No.5',580000,0],['SK-II Treatment',320000,380000],['MAC Lipstick',95000,0],['La Mer Cream',450000,0],['Dior Foundation',165000,190000]] },
    { email: 'home@eseller.mn', name: 'Баярсайхан Лхагва', username: 'homemn', shopName: 'Home Decor MN', slug: 'home-decor-mn', cat: 'Тавилга', imgs: 'furniture' as const,
      products: [['Диван 3 суудалтай',1800000,2200000],['Модон ширээ',650000,0],['Унтлагын ор',1200000,0],['Хувцасны шкаф',890000,1100000],['Кофе ширээ',380000,0]] },
  ]

  for (const s of shops) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { email: s.email, name: s.name, username: s.username, password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', role: 'seller', phone: '9900' + Math.floor(1000+Math.random()*9000) },
    })
    const shop = await prisma.shop.upsert({
      where: { slug: s.slug },
      update: {},
      create: { userId: user.id, name: s.shopName, slug: s.slug, storefrontSlug: s.slug, industry: s.cat, logo: IMGS[s.imgs][0], allowSellers: true, sellerCommission: 15 },
    })
    await prisma.shopSubscription.upsert({
      where: { shopId: shop.id },
      update: {},
      create: { shopId: shop.id, planKey: 'standard', status: 'active' },
    })
    for (let i = 0; i < s.products.length; i++) {
      const [name, price, orig] = s.products[i]
      await prisma.product.create({
        data: {
          userId: user.id,
          name: name as string,
          price: price as number,
          salePrice: (orig as number) > 0 ? (orig as number) : null,
          images: [IMGS[s.imgs][i % 3], IMGS[s.imgs][(i + 1) % 3]],
          category: s.cat,
          stock: 20 + Math.floor(Math.random() * 80),
          isActive: true,
        }
      })
    }
    console.log(`✓ ${s.shopName}: ${s.products.length} products`)
  }

  for (const b of [
    { email: 'buyer1@eseller.mn', name: 'Солонго Мөнхбаяр', username: 'solongo' },
    { email: 'buyer2@eseller.mn', name: 'Тэмүүлэн Батсайхан', username: 'temuulen' },
  ]) {
    await prisma.user.upsert({
      where: { email: b.email }, update: {},
      create: { ...b, password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', role: 'buyer' },
    })
  }
  console.log('✓ 2 buyers created')
  console.log('\n🎉 DEMO SEED COMPLETE')
  console.log('admin@eseller.mn / password')
  console.log('fashion@eseller.mn / password')
}

main().catch(console.error).finally(() => prisma.$disconnect())