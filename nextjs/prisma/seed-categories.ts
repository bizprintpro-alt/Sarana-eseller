import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CatDef {
  slug: string
  name: string
  nameEn?: string
  icon?: string
  level?: number
  sortOrder?: number
  entityTypes?: string[]
  isFeatured?: boolean
  children?: CatDef[]
}

// ══════════════════════════════════════════════════════════════
// 16 ҮНДСЭН + 100+ ДЭД АНГИЛАЛ
// ══════════════════════════════════════════════════════════════

const CATEGORIES: CatDef[] = [
  // 1. ЭЛЕКТРОНИК
  {
    slug: 'electronics', name: 'Электроник & Технологи', icon: '💻', sortOrder: 1,
    entityTypes: ['STORE', 'PRE_ORDER', 'DIGITAL'], isFeatured: true,
    children: [
      { slug: 'phones', name: 'Гар утас', icon: '📱', sortOrder: 1, children: [
        { slug: 'smartphones', name: 'Ухаалаг утас' },
        { slug: 'phone-cases', name: 'Утасны хүснэгтүүл' },
        { slug: 'phone-chargers', name: 'Цэнэглэгч & Кабель' },
        { slug: 'phone-screens', name: 'Дэлгэц & Сэлбэг' },
      ]},
      { slug: 'computers', name: 'Компьютер & Нөөврийн', icon: '🖥', sortOrder: 2, children: [
        { slug: 'laptops', name: 'Нөөврийн компьютер' },
        { slug: 'desktops', name: 'Суурин компьютер' },
        { slug: 'computer-parts', name: 'Компьютерийн сэлбэг' },
        { slug: 'monitors', name: 'Монитор & Дэлгэц' },
        { slug: 'keyboards-mice', name: 'Гар & Хулганаа' },
        { slug: 'storage', name: 'Хадгалах төхөөрөмж' },
      ]},
      { slug: 'tv-audio', name: 'Зурагт & Аудио', icon: '📺', sortOrder: 3, children: [
        { slug: 'tvs', name: 'Зурагт & Телевизор' },
        { slug: 'speakers', name: 'Чанга яригч' },
        { slug: 'headphones', name: 'Чихэвч' },
        { slug: 'projectors', name: 'Проектор' },
      ]},
      { slug: 'cameras', name: 'Камер & Зураг', icon: '📷', sortOrder: 4, children: [
        { slug: 'digital-cameras', name: 'Дижитал камер' },
        { slug: 'action-cameras', name: 'Экшн камер' },
        { slug: 'drones', name: 'Дрон' },
        { slug: 'camera-accessories', name: 'Камерийн хэрэгсэл' },
      ]},
      { slug: 'smart-devices', name: 'Ухаалаг төхөөрөмж', icon: '⌚', sortOrder: 5, children: [
        { slug: 'smart-watches', name: 'Ухаалаг цаг' },
        { slug: 'smart-home', name: 'Ухаалаг гэр' },
        { slug: 'vr-ar', name: 'VR/AR төхөөрөмж' },
      ]},
      { slug: 'gaming', name: 'Тоглоомын хэрэгсэл', icon: '🎮', sortOrder: 6 },
      { slug: 'printers', name: 'Принтер & Сканнер', icon: '🖨', sortOrder: 7 },
    ],
  },

  // 2. ХУВЦАС
  {
    slug: 'fashion', name: 'Хувцас & Гутал', icon: '👗', sortOrder: 2,
    entityTypes: ['STORE', 'PRE_ORDER'], isFeatured: true,
    children: [
      { slug: 'womens-clothing', name: 'Эмэгтэй хувцас', icon: '👚', sortOrder: 1, children: [
        { slug: 'womens-tops', name: 'Дээд хувцас' },
        { slug: 'womens-bottoms', name: 'Доод хувцас' },
        { slug: 'womens-dresses', name: 'Даашинз & Юбка' },
        { slug: 'womens-outerwear', name: 'Гоёссон хувцас' },
        { slug: 'womens-coats', name: 'Пальто & Куртик' },
      ]},
      { slug: 'mens-clothing', name: 'Эрэгтэй хувцас', icon: '👔', sortOrder: 2, children: [
        { slug: 'mens-tops', name: 'Дээд хувцас' },
        { slug: 'mens-bottoms', name: 'Доод хувцас' },
        { slug: 'mens-suits', name: 'Костюм & Гүстүмэ' },
        { slug: 'mens-coats', name: 'Пальто & Куртик' },
      ]},
      { slug: 'kids-clothing', name: 'Хүүхдийн хувцас', icon: '👶', sortOrder: 3, children: [
        { slug: 'baby-clothing', name: 'Нярайн хувцас (0-2)' },
        { slug: 'toddler-clothing', name: 'Бага насны (2-7)' },
        { slug: 'kids-tops', name: 'Хүүхдийн дээд' },
        { slug: 'kids-bottoms', name: 'Хүүхдийн доод' },
      ]},
      { slug: 'shoes', name: 'Гутал', icon: '👟', sortOrder: 4, children: [
        { slug: 'womens-shoes', name: 'Эмэгтэй гутал' },
        { slug: 'mens-shoes', name: 'Эрэгтэй гутал' },
        { slug: 'kids-shoes', name: 'Хүүхдийн гутал' },
        { slug: 'sports-shoes', name: 'Спортын гутал' },
        { slug: 'boots', name: 'Гутал & Гүслэн' },
      ]},
      { slug: 'bags', name: 'Цүнх & Аксессуар', icon: '👜', sortOrder: 5, children: [
        { slug: 'handbags', name: 'Цүнх' },
        { slug: 'backpacks', name: 'Нүрсэвч' },
        { slug: 'wallets', name: 'Хэтэвч' },
        { slug: 'belts-ties', name: 'Бүс & Зангиа' },
        { slug: 'hats-scarves', name: 'Малгай & Ороолт' },
        { slug: 'sunglasses', name: 'Нарны шил' },
      ]},
      { slug: 'traditional-clothing', name: 'Үндэсний хувцас', icon: '🥻', sortOrder: 6 },
      { slug: 'sportswear', name: 'Спортын хувцас', icon: '🏃', sortOrder: 7 },
    ],
  },

  // 3. ГЭР АХУЙ
  {
    slug: 'home-living', name: 'Гэр Ахуй & Тавилга', icon: '🏠', sortOrder: 3,
    entityTypes: ['STORE', 'PRE_ORDER'], isFeatured: true,
    children: [
      { slug: 'furniture', name: 'Тавилга', icon: '🛋', sortOrder: 1, children: [
        { slug: 'sofas-armchairs', name: 'Диван & Сандал' },
        { slug: 'beds', name: 'Ор & Матрас' },
        { slug: 'tables-chairs', name: 'Ширээ & Сандал' },
        { slug: 'wardrobes', name: 'Шкаф & Сейф' },
        { slug: 'shelves-racks', name: 'Тавиур & Ширэнтээ' },
        { slug: 'office-furniture', name: 'Оффисын тавилга' },
      ]},
      { slug: 'kitchen', name: 'Гал тогооны хэрэгсэл', icon: '🍳', sortOrder: 2, children: [
        { slug: 'cookware', name: 'Тогоо & Таваг' },
        { slug: 'kitchen-appliances', name: 'Дижиг хэрэгсэл' },
        { slug: 'tableware', name: 'Аяга таваг' },
      ]},
      { slug: 'home-decor', name: 'Гэрийн чимэглэл', icon: '🖼', sortOrder: 3, children: [
        { slug: 'wall-decor', name: 'Ханан чимэглэл' },
        { slug: 'lighting', name: 'Гэрэлтүүлэг' },
        { slug: 'carpets-rugs', name: 'Хивс & Шүвгүүр' },
        { slug: 'curtains', name: 'Хөшиг & Далаа' },
        { slug: 'plants-pots', name: 'Ургамал & Сав' },
      ]},
      { slug: 'large-appliances', name: 'Том хэрэгсэл', icon: '🧺', sortOrder: 4, children: [
        { slug: 'refrigerators', name: 'Хөргөгч' },
        { slug: 'washing-machines', name: 'Угаалгын машин' },
        { slug: 'air-conditioners', name: 'Агааржуулагч' },
        { slug: 'vacuum-cleaners', name: 'Тоос сорогч' },
      ]},
      { slug: 'ger-supplies', name: 'Гэрийн хэрэгсэл', icon: '🏕', sortOrder: 5 },
    ],
  },

  // 4. ГОО САЙХАН
  {
    slug: 'beauty-health', name: 'Гоо Сайхан & Эрүүл Мэнд', icon: '💄', sortOrder: 4,
    entityTypes: ['STORE', 'PRE_ORDER'], isFeatured: true,
    children: [
      { slug: 'skincare', name: 'Арьс засах', icon: '🧴', sortOrder: 1, children: [
        { slug: 'face-care', name: 'Нүүрний арчилгаа' },
        { slug: 'body-care', name: 'Биеийн арчилгаа' },
        { slug: 'sunscreen', name: 'Нарнаас хамгаалах' },
      ]},
      { slug: 'makeup', name: 'Гоо сайхны бараа', icon: '💋', sortOrder: 2, children: [
        { slug: 'face-makeup', name: 'Нүүрний будаг' },
        { slug: 'eye-makeup', name: 'Нүдний будаг' },
        { slug: 'lip-products', name: 'Уруулын будаг' },
        { slug: 'nail-care', name: 'Хумсны арчилгаа' },
      ]},
      { slug: 'hair-care', name: 'Үсний арчилгаа', icon: '💇', sortOrder: 3, children: [
        { slug: 'shampoo-conditioner', name: 'Шампунь & Бальзам' },
        { slug: 'hair-styling', name: 'Үс засах' },
      ]},
      { slug: 'health-wellness', name: 'Эрүүл мэнд', icon: '💊', sortOrder: 4, children: [
        { slug: 'vitamins-supplements', name: 'Витамин & Нэмэлт' },
        { slug: 'medical-devices', name: 'Эмнэлгийн хэрэгсэл' },
        { slug: 'personal-care', name: 'Хувийн арчилгаа' },
      ]},
      { slug: 'fragrances', name: 'Үнэртэн', icon: '🌸', sortOrder: 5 },
    ],
  },

  // 5. ХҮҮХДИЙН
  {
    slug: 'kids-toys', name: 'Хүүхдийн Бараа & Тоглоом', icon: '🧸', sortOrder: 5,
    entityTypes: ['STORE', 'PRE_ORDER'],
    children: [
      { slug: 'baby-essentials', name: 'Нярайн хэрэгсэл', icon: '🍼', sortOrder: 1 },
      { slug: 'toys', name: 'Тоглоом', icon: '🧩', sortOrder: 2, children: [
        { slug: 'educational-toys', name: 'Сургалтын тоглоом' },
        { slug: 'lego-blocks', name: 'Лего & Блок' },
        { slug: 'dolls', name: 'Хүүхэлдэй' },
        { slug: 'outdoor-toys', name: 'Гадна тоглоом' },
      ]},
      { slug: 'school-supplies', name: 'Сургуулийн хэрэгсэл', icon: '🎒', sortOrder: 3 },
      { slug: 'strollers-carseats', name: 'Тэрэг & Суудал', icon: '🛒', sortOrder: 4 },
    ],
  },

  // 6. СПОРТ
  {
    slug: 'sports-travel', name: 'Спорт & Аялал', icon: '⚽', sortOrder: 6,
    entityTypes: ['STORE', 'PRE_ORDER'],
    children: [
      { slug: 'team-sports', name: 'Баг спорт', icon: '🏀', sortOrder: 1, children: [
        { slug: 'football', name: 'Хөлбөмбөг' },
        { slug: 'basketball', name: 'Сагсан бөмбөг' },
        { slug: 'boxing', name: 'Бокс & Тулааны спорт' },
      ]},
      { slug: 'fitness', name: 'Фитнесс & Тамир', icon: '💪', sortOrder: 2, children: [
        { slug: 'gym-equipment', name: 'Фитнессийн тоног' },
        { slug: 'yoga-pilates', name: 'Йога & Пилатес' },
        { slug: 'running', name: 'Гүйлт & Алхалт' },
      ]},
      { slug: 'outdoor-sports', name: 'Гадна спорт', icon: '⛷', sortOrder: 3, children: [
        { slug: 'cycling', name: 'Дугуй' },
        { slug: 'skiing', name: 'Цанаар гулгалт' },
        { slug: 'fishing', name: 'Загасчлал' },
      ]},
      { slug: 'travel', name: 'Аялал', icon: '✈', sortOrder: 4, children: [
        { slug: 'luggage', name: 'Чемодан & Цүнх' },
        { slug: 'camping', name: 'Явган аялал' },
      ]},
    ],
  },

  // 7. ХОЛ & УНД
  {
    slug: 'food-beverage', name: 'Хол & Унд', icon: '🍔', sortOrder: 7,
    entityTypes: ['STORE', 'PRE_ORDER'],
    children: [
      { slug: 'fresh-food', name: 'Шинэ хүнс', icon: '🥩', sortOrder: 1 },
      { slug: 'packaged-food', name: 'Боодолтой хүнс', icon: '🥫', sortOrder: 2 },
      { slug: 'beverages', name: 'Ундаа', icon: '🥤', sortOrder: 3 },
      { slug: 'snacks', name: 'Зигнэмэг & Чихэр', icon: '🍫', sortOrder: 4 },
      { slug: 'dairy', name: 'Сүүн бүтээгдэхүүн', icon: '🥛', sortOrder: 5 },
      { slug: 'organic-food', name: 'Органик хүнс', icon: '🌾', sortOrder: 6 },
      { slug: 'mongolian-food', name: 'Монгол хүнс', icon: '🍖', sortOrder: 7 },
    ],
  },

  // 8. НОМ
  {
    slug: 'books-education', name: 'Ном & Боловсрол', icon: '📚', sortOrder: 8,
    entityTypes: ['STORE', 'DIGITAL', 'PRE_ORDER'],
    children: [
      { slug: 'mongolian-books', name: 'Монгол ном', icon: '📖', sortOrder: 1 },
      { slug: 'textbooks', name: 'Сурах бичиг', icon: '📕', sortOrder: 2 },
      { slug: 'childrens-books', name: 'Хүүхдийн ном', icon: '🖍', sortOrder: 3 },
      { slug: 'stationery', name: 'Бичиг хэрэг', icon: '✏', sortOrder: 4 },
      { slug: 'online-courses', name: 'Онлайн курс', icon: '🎓', sortOrder: 5 },
    ],
  },

  // 9. АВТО
  {
    slug: 'auto-moto', name: 'Авто & Мото', icon: '🚗', sortOrder: 9,
    entityTypes: ['STORE', 'AUTO'],
    children: [
      { slug: 'car-accessories', name: 'Автомашины аксессуар', icon: '🔧', sortOrder: 1, children: [
        { slug: 'car-electronics', name: 'Авто электроник' },
        { slug: 'car-tires', name: 'Дугуй & Обод' },
        { slug: 'car-interior', name: 'Дотор чимэглэл' },
        { slug: 'car-audio', name: 'Авто аудио' },
      ]},
      { slug: 'car-parts', name: 'Авто эд анги', icon: '⚙', sortOrder: 2, children: [
        { slug: 'engine-parts', name: 'Хөдөлгүүрийн эд анги' },
        { slug: 'brake-system', name: 'Тоормосны систем' },
        { slug: 'oil-filters', name: 'Тос & Шүүлтүүр' },
      ]},
      { slug: 'car-care', name: 'Авто арчилгаа', icon: '🧿', sortOrder: 3 },
      { slug: 'motorcycle', name: 'Мотоцикл', icon: '🏍', sortOrder: 4 },
    ],
  },

  // 10. БАРИЛГА
  {
    slug: 'construction', name: 'Барилга & Засвар', icon: '🔨', sortOrder: 10,
    entityTypes: ['STORE', 'CONSTRUCTION'],
    children: [
      { slug: 'building-materials', name: 'Барилгын материал', icon: '🧱', sortOrder: 1 },
      { slug: 'tools', name: 'Хэрэгсэл & Багаж', icon: '🔧', sortOrder: 2 },
      { slug: 'plumbing', name: 'Усны хэрэгсэл', icon: '🚿', sortOrder: 3 },
      { slug: 'electrical', name: 'Цахилгааны хэрэгсэл', icon: '⚡', sortOrder: 4 },
      { slug: 'paint-supplies', name: 'Будаг & Хэрэгсэл', icon: '🎨', sortOrder: 5 },
    ],
  },

  // 11. ЗООС ЧИМЭГЛЭЛ
  {
    slug: 'jewelry-gifts', name: 'Зоос Чимэглэл & Бэлэг', icon: '💍', sortOrder: 11,
    entityTypes: ['STORE', 'PRE_ORDER'],
    children: [
      { slug: 'jewelry', name: 'Чимэглэл', icon: '💎', sortOrder: 1 },
      { slug: 'watches', name: 'Цаг', icon: '⌚', sortOrder: 2 },
      { slug: 'gifts', name: 'Бэлэг', icon: '🎁', sortOrder: 3 },
      { slug: 'flowers', name: 'Цэцэг', icon: '🌷', sortOrder: 4 },
      { slug: 'mongolian-crafts', name: 'Монгол гар урлал', icon: '🪬', sortOrder: 5 },
    ],
  },

  // 12. ГАЛ АМЬТАН
  {
    slug: 'pets', name: 'Гал Амьтан', icon: '🐾', sortOrder: 12,
    entityTypes: ['STORE'],
    children: [
      { slug: 'dog-supplies', name: 'Нохойн хэрэгсэл', icon: '🐕', sortOrder: 1 },
      { slug: 'cat-supplies', name: 'Муурны хэрэгсэл', icon: '🐈', sortOrder: 2 },
      { slug: 'pet-food', name: 'Тэжээл', icon: '🦴', sortOrder: 3 },
      { slug: 'pet-accessories', name: 'Аксессуар', icon: '🐾', sortOrder: 4 },
    ],
  },

  // 13. УРЛАГ
  {
    slug: 'arts-music', name: 'Урлаг & Хөгжим', icon: '🎵', sortOrder: 13,
    entityTypes: ['STORE', 'DIGITAL'],
    children: [
      { slug: 'musical-instruments', name: 'Хөгжмийн зэмсэг', icon: '🎸', sortOrder: 1 },
      { slug: 'art-materials', name: 'Урлагийн материал', icon: '🎨', sortOrder: 2 },
      { slug: 'craft-supplies', name: 'Гар урлалын хэрэгсэл', icon: '✂', sortOrder: 3 },
    ],
  },

  // 14. ДИЖИТАЛ
  {
    slug: 'digital-goods', name: 'Дижитал Бараа & Програм', icon: '💾', sortOrder: 14,
    entityTypes: ['DIGITAL'],
    children: [
      { slug: 'software', name: 'Програм хангамж', icon: '💻', sortOrder: 1 },
      { slug: 'templates', name: 'Загвар & Template', icon: '📑', sortOrder: 2 },
      { slug: 'digital-art', name: 'Дижитал урлаг', icon: '🎨', sortOrder: 3 },
      { slug: 'presets', name: 'Preset & Filter', icon: '📷', sortOrder: 4 },
      { slug: 'ebooks-courses', name: 'Ном & Курс', icon: '📘', sortOrder: 5 },
    ],
  },

  // 15. ХӨДӨӨ АЖ АХУЙ
  {
    slug: 'agriculture', name: 'Хөдөө Аж Ахуй', icon: '🌾', sortOrder: 15,
    entityTypes: ['STORE', 'PRE_ORDER'],
    children: [
      { slug: 'seeds-plants', name: 'Үр & Ургамал', icon: '🌱', sortOrder: 1 },
      { slug: 'farming-tools', name: 'Тариалангийн хэрэгсэл', icon: '🚜', sortOrder: 2 },
      { slug: 'animal-feed', name: 'Малын тэжээл', icon: '🐿', sortOrder: 3 },
      { slug: 'vet-supplies', name: 'Малын эм & хэрэгсэл', icon: '🐄', sortOrder: 4 },
    ],
  },

  // 16. ОФФИС
  {
    slug: 'office-business', name: 'Оффис & Бизнес', icon: '💼', sortOrder: 16,
    entityTypes: ['STORE', 'DIGITAL'],
    children: [
      { slug: 'office-supplies', name: 'Оффисын хэрэгсэл', icon: '📎', sortOrder: 1 },
      { slug: 'printers-supplies', name: 'Принтер & Картридж', icon: '🖨', sortOrder: 2 },
      { slug: 'office-furniture-biz', name: 'Оффисын тавилга', icon: '🪑', sortOrder: 3 },
      { slug: 'pos-systems', name: 'POS систем', icon: '💳', sortOrder: 4 },
    ],
  },
]

// ══════════════════════════════════════════════════════════════
// RECURSIVE SEED
// ══════════════════════════════════════════════════════════════

async function seedCategories(cats: CatDef[], parentId: string | null = null, level: number = 0) {
  for (const cat of cats) {
    const { children, ...data } = cat

    const created = await prisma.category.upsert({
      where: { slug: data.slug },
      update: {
        name: data.name,
        nameEn: data.nameEn,
        icon: data.icon,
        sortOrder: data.sortOrder || 0,
        entityTypes: data.entityTypes || [],
        isFeatured: data.isFeatured || false,
        parentId,
        level,
      },
      create: {
        slug: data.slug,
        name: data.name,
        nameEn: data.nameEn,
        icon: data.icon,
        sortOrder: data.sortOrder || 0,
        entityTypes: data.entityTypes || [],
        isFeatured: data.isFeatured || false,
        parentId,
        level,
      },
    })

    if (children?.length) {
      await seedCategories(children, created.id, level + 1)
    }
  }
}

async function main() {
  console.log('📁 Seeding categories...\n')
  await seedCategories(CATEGORIES)

  const total = await prisma.category.count()
  const roots = await prisma.category.count({ where: { level: 0 } })
  const subs = await prisma.category.count({ where: { level: 1 } })
  const leafs = await prisma.category.count({ where: { level: 2 } })

  console.log(`✓ Categories seeded!`)
  console.log(`  Root:   ${roots}`)
  console.log(`  Sub:    ${subs}`)
  console.log(`  Leaf:   ${leafs}`)
  console.log(`  Total:  ${total}\n`)
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
