// eseller.mn — БҮРЭН АНГИЛАЛЫН БҮТЭЦ (19 ангилал, 4-5 түвшин)
// Түвшин 1: Үндсэн ангилал | Түвшин 2: Дэд ангилал | Түвшин 3: Төрөл | Түвшин 4: Загвар/Брэнд | Түвшин 5: Нарийвчлал

export interface Category {
  id: string;
  name: string;
  icon?: string;
  children?: Category[];
}

export const CATEGORIES: Category[] = [
  // ══════════════════════════════════════
  // 1. АВТО
  // ══════════════════════════════════════
  {
    id: 'auto', name: 'Авто', icon: 'car',
    children: [
      { id: 'auto-sell', name: 'Машин зарна', children: [
        { id: 'auto-sell-passenger', name: 'Суудлын автомашин', children: [
          { id: 'auto-toyota', name: 'Toyota', children: [
            { id: 'auto-toyota-prius', name: 'Prius (20, 30, 40, 50)' },
            { id: 'auto-toyota-camry', name: 'Camry' },
            { id: 'auto-toyota-corolla', name: 'Corolla' },
            { id: 'auto-toyota-rav4', name: 'RAV4' },
            { id: 'auto-toyota-lc', name: 'Land Cruiser (100, 200, 300)' },
            { id: 'auto-toyota-highlander', name: 'Highlander' },
            { id: 'auto-toyota-alphard', name: 'Alphard / Vellfire' },
            { id: 'auto-toyota-harrier', name: 'Harrier' },
            { id: 'auto-toyota-aqua', name: 'Aqua' },
            { id: 'auto-toyota-noah', name: 'Noah / Voxy' },
            { id: 'auto-toyota-chr', name: 'C-HR' },
            { id: 'auto-toyota-other', name: 'Бусад Toyota' },
          ]},
          { id: 'auto-hyundai', name: 'Hyundai', children: [
            { id: 'auto-hyundai-tucson', name: 'Tucson' },
            { id: 'auto-hyundai-santafe', name: 'Santa Fe' },
            { id: 'auto-hyundai-sonata', name: 'Sonata' },
            { id: 'auto-hyundai-avante', name: 'Avante / Elantra' },
            { id: 'auto-hyundai-starex', name: 'Starex / Staria' },
            { id: 'auto-hyundai-accent', name: 'Accent' },
            { id: 'auto-hyundai-creta', name: 'Creta / ix35' },
            { id: 'auto-hyundai-other', name: 'Бусад Hyundai' },
          ]},
          { id: 'auto-lexus', name: 'Lexus', children: [
            { id: 'auto-lexus-rx', name: 'RX (300, 350, 450h)' },
            { id: 'auto-lexus-lx', name: 'LX (470, 570, 600)' },
            { id: 'auto-lexus-nx', name: 'NX' },
            { id: 'auto-lexus-is', name: 'IS' },
            { id: 'auto-lexus-es', name: 'ES' },
            { id: 'auto-lexus-other', name: 'Бусад Lexus' },
          ]},
          { id: 'auto-bmw', name: 'BMW', children: [
            { id: 'auto-bmw-3', name: '3 серия' },
            { id: 'auto-bmw-5', name: '5 серия' },
            { id: 'auto-bmw-x3', name: 'X3' },
            { id: 'auto-bmw-x5', name: 'X5' },
            { id: 'auto-bmw-x6', name: 'X6' },
            { id: 'auto-bmw-other', name: 'Бусад BMW' },
          ]},
          { id: 'auto-mercedes', name: 'Mercedes-Benz', children: [
            { id: 'auto-merc-c', name: 'C-Class' },
            { id: 'auto-merc-e', name: 'E-Class' },
            { id: 'auto-merc-s', name: 'S-Class' },
            { id: 'auto-merc-gle', name: 'GLE / GLC' },
            { id: 'auto-merc-other', name: 'Бусад Mercedes' },
          ]},
          { id: 'auto-kia', name: 'Kia', children: [
            { id: 'auto-kia-sportage', name: 'Sportage' },
            { id: 'auto-kia-sorento', name: 'Sorento' },
            { id: 'auto-kia-k5', name: 'K5 / Optima' },
            { id: 'auto-kia-morning', name: 'Morning / Picanto' },
            { id: 'auto-kia-carnival', name: 'Carnival' },
            { id: 'auto-kia-other', name: 'Бусад Kia' },
          ]},
          { id: 'auto-honda', name: 'Honda', children: [
            { id: 'auto-honda-crv', name: 'CR-V' },
            { id: 'auto-honda-fit', name: 'Fit / Jazz' },
            { id: 'auto-honda-vezel', name: 'Vezel / HR-V' },
            { id: 'auto-honda-civic', name: 'Civic' },
            { id: 'auto-honda-other', name: 'Бусад Honda' },
          ]},
          { id: 'auto-mitsubishi', name: 'Mitsubishi', children: [
            { id: 'auto-mits-outlander', name: 'Outlander' },
            { id: 'auto-mits-pajero', name: 'Pajero' },
            { id: 'auto-mits-delica', name: 'Delica' },
            { id: 'auto-mits-eclipse', name: 'Eclipse Cross' },
            { id: 'auto-mits-other', name: 'Бусад Mitsubishi' },
          ]},
          { id: 'auto-nissan', name: 'Nissan', children: [
            { id: 'auto-nissan-xtrail', name: 'X-Trail' },
            { id: 'auto-nissan-note', name: 'Note' },
            { id: 'auto-nissan-serena', name: 'Serena' },
            { id: 'auto-nissan-patrol', name: 'Patrol' },
            { id: 'auto-nissan-other', name: 'Бусад Nissan' },
          ]},
          { id: 'auto-suzuki', name: 'Suzuki', children: [
            { id: 'auto-suzuki-escudo', name: 'Escudo / Vitara' },
            { id: 'auto-suzuki-swift', name: 'Swift' },
            { id: 'auto-suzuki-jimny', name: 'Jimny' },
            { id: 'auto-suzuki-other', name: 'Бусад Suzuki' },
          ]},
          { id: 'auto-subaru', name: 'Subaru', children: [
            { id: 'auto-subaru-forester', name: 'Forester' },
            { id: 'auto-subaru-outback', name: 'Outback' },
            { id: 'auto-subaru-xv', name: 'XV / Crosstrek' },
            { id: 'auto-subaru-other', name: 'Бусад Subaru' },
          ]},
          { id: 'auto-ford', name: 'Ford', children: [
            { id: 'auto-ford-explorer', name: 'Explorer' },
            { id: 'auto-ford-everest', name: 'Everest' },
            { id: 'auto-ford-ranger', name: 'Ranger' },
          { id: 'auto-ford-other', name: 'Бусад Ford' },
          ]},
          { id: 'auto-volvo', name: 'Volvo', children: [
            { id: 'auto-volvo-xc60', name: 'XC60' },
            { id: 'auto-volvo-xc90', name: 'XC90' },
            { id: 'auto-volvo-other', name: 'Бусад Volvo' },
          ]},
          { id: 'auto-volkswagen', name: 'Volkswagen', children: [
            { id: 'auto-vw-tiguan', name: 'Tiguan' },
            { id: 'auto-vw-passat', name: 'Passat' },
            { id: 'auto-vw-other', name: 'Бусад VW' },
          ]},
          { id: 'auto-audi', name: 'Audi', children: [
            { id: 'auto-audi-a4', name: 'A4' },
            { id: 'auto-audi-q5', name: 'Q5' },
            { id: 'auto-audi-q7', name: 'Q7' },
            { id: 'auto-audi-other', name: 'Бусад Audi' },
          ]},
          { id: 'auto-chevrolet', name: 'Chevrolet', children: [
            { id: 'auto-chevy-cruze', name: 'Cruze' },
            { id: 'auto-chevy-orlando', name: 'Orlando' },
            { id: 'auto-chevy-other', name: 'Бусад Chevrolet' },
          ]},
          { id: 'auto-ssangyong', name: 'SsangYong', children: [
            { id: 'auto-ssang-rexton', name: 'Rexton' },
            { id: 'auto-ssang-tivoli', name: 'Tivoli' },
            { id: 'auto-ssang-other', name: 'Бусад SsangYong' },
          ]},
          { id: 'auto-other-brand', name: 'Бусад үйлдвэрлэгч' },
        ]},
        { id: 'auto-sell-truck', name: 'Ачааны машин', children: [
          { id: 'auto-truck-light', name: 'Хөнгөн ачааны (3.5 тонн хүртэл)' },
          { id: 'auto-truck-mid', name: 'Дунд ачааны (3.5-12 тонн)' },
          { id: 'auto-truck-heavy', name: 'Хүнд ачааны (12+ тонн)' },
          { id: 'auto-truck-dump', name: 'Самосвал' },
          { id: 'auto-truck-other', name: 'Бусад ачааны' },
        ]},
        { id: 'auto-sell-bus', name: 'Автобус, микроавтобус', children: [
          { id: 'auto-bus-micro', name: 'Микроавтобус (8-15 суудал)' },
          { id: 'auto-bus-full', name: 'Автобус (15+ суудал)' },
          { id: 'auto-bus-special', name: 'Тусгай зориулалтын' },
        ]},
        { id: 'auto-sell-moto', name: 'Мотоцикл', children: [
          { id: 'auto-moto-standard', name: 'Суудлын мотоцикл' },
          { id: 'auto-moto-scooter', name: 'Скутер' },
          { id: 'auto-moto-atv', name: 'ATV / Квадроцикл' },
          { id: 'auto-moto-other', name: 'Бусад' },
        ]},
        { id: 'auto-sell-heavy', name: 'Хүнд механизм', children: [
          { id: 'auto-heavy-excavator', name: 'Экскаватор' },
          { id: 'auto-heavy-crane', name: 'Кран' },
          { id: 'auto-heavy-bulldozer', name: 'Бульдозер' },
          { id: 'auto-heavy-other', name: 'Бусад хүнд техник' },
        ]},
      ]},
      { id: 'auto-parts', name: 'Авто сэлбэг, тоноглол', children: [
        { id: 'auto-parts-engine', name: 'Хөдөлгүүрийн сэлбэг' },
        { id: 'auto-parts-transmission', name: 'Явах эд ангийн сэлбэг' },
        { id: 'auto-parts-electric', name: 'Цахилгааны сэлбэг' },
        { id: 'auto-parts-body', name: 'Бүх төрлийн шил' },
        { id: 'auto-parts-wheels', name: 'Дугуй, обод', children: [
          { id: 'auto-wheels-summer', name: 'Зуны дугуй' },
          { id: 'auto-wheels-winter', name: 'Өвлийн дугуй' },
          { id: 'auto-wheels-rim', name: 'Обод (R14-R22)' },
          { id: 'auto-wheels-other', name: 'Бусад' },
        ]},
        { id: 'auto-parts-acc', name: 'Нагалдах тоноглол', children: [
          { id: 'auto-acc-dashcam', name: 'Видео бичлэгч (dashcam)' },
          { id: 'auto-acc-gps', name: 'GPS навигаци' },
          { id: 'auto-acc-seat', name: 'Суудлын бүрээс' },
          { id: 'auto-acc-cover', name: 'Шалавч' },
          { id: 'auto-acc-other', name: 'Бусад' },
        ]},
        { id: 'auto-parts-chemical', name: 'Авто хими, тос' },
        { id: 'auto-parts-other', name: 'Бусад авто сэлбэг' },
      ]},
      { id: 'auto-rent', name: 'Авто түрээс' },
      { id: 'auto-insurance', name: 'Авто даатгал' },
      { id: 'auto-service', name: 'Авто засвар, үйлчилгээ', children: [
        { id: 'auto-svc-engine', name: 'Хөдөлгүүр засвар' },
        { id: 'auto-svc-transmission', name: 'Явах эд ангийн засвар' },
        { id: 'auto-svc-electric', name: 'Цахилгааны засвар' },
        { id: 'auto-svc-paint', name: 'Будаг, засвар' },
        { id: 'auto-svc-wash', name: 'Авто угаалга' },
        { id: 'auto-svc-other', name: 'Бусад засвар' },
      ]},
    ],
  },

  // ══════════════════════════════════════
  // 2. ҮЛ ХӨДЛӨХ ★ШИНЭ
  // ══════════════════════════════════════
  {
    id: 'realestate', name: 'Үл хөдлөх', icon: 'home',
    children: [
      { id: 're-sell', name: 'Үл хөдлөх зарна', children: [
        { id: 're-sell-apt', name: 'Орон сууц', children: [
          { id: 're-sell-apt-1', name: '1 өрөө' },
          { id: 're-sell-apt-2', name: '2 өрөө' },
          { id: 're-sell-apt-3', name: '3 өрөө' },
          { id: 're-sell-apt-4', name: '4+ өрөө' },
          { id: 're-sell-apt-studio', name: 'Студио' },
        ]},
        { id: 're-sell-house', name: 'Хашаа байшин' },
        { id: 're-sell-ger', name: 'Монгол гэр' },
        { id: 're-sell-land', name: 'Газар' },
        { id: 're-sell-office', name: 'Оффис' },
        { id: 're-sell-garage', name: 'Гараж, контейнер' },
        { id: 're-sell-resort', name: 'ХАА, ташт, зуслан' },
      ]},
      { id: 're-rent', name: 'Үл хөдлөх түрээслүүлнэ', children: [
        { id: 're-rent-apt', name: 'Орон сууц', children: [
          { id: 're-rent-apt-1', name: '1 өрөө' },
          { id: 're-rent-apt-2', name: '2 өрөө' },
          { id: 're-rent-apt-3', name: '3 өрөө' },
          { id: 're-rent-apt-4', name: '4+ өрөө' },
          { id: 're-rent-apt-shared', name: 'Хоногоор байр' },
        ]},
        { id: 're-rent-house', name: 'Хашаа байшин, гэр' },
        { id: 're-rent-office', name: 'Оффис' },
        { id: 're-rent-commercial', name: 'Худалдаа, үйлчилгээний талбай' },
        { id: 're-rent-factory', name: 'Үйлдвэр, агуулах, обьект' },
        { id: 're-rent-event', name: 'Бийтийн байр, доторх байр' },
        { id: 're-rent-garage', name: 'Гараж, контейнер' },
        { id: 're-rent-hall', name: 'Хурлын өрөө, заал' },
        { id: 're-rent-land', name: 'Газар' },
        { id: 're-rent-resort', name: 'ХАА, ташт, зуслан, амралтын газар' },
      ]},
    ],
  },

  // ══════════════════════════════════════
  // 3. ЭЛЕКТРОНИК
  // ══════════════════════════════════════
  {
    id: 'electronics', name: 'Электроник', icon: 'phone-portrait',
    children: [
      { id: 'elec-phone', name: 'Гар утас', children: [
        { id: 'elec-phone-apple', name: 'Apple', children: [
          { id: 'elec-apple-16', name: 'iPhone 16 цуврал' },
          { id: 'elec-apple-15', name: 'iPhone 15 цуврал' },
          { id: 'elec-apple-14', name: 'iPhone 14 цуврал' },
          { id: 'elec-apple-13', name: 'iPhone 13 ба түүнээс' },
          { id: 'elec-apple-other', name: 'Бусад Apple' },
        ]},
        { id: 'elec-phone-samsung', name: 'Samsung', children: [
          { id: 'elec-samsung-s', name: 'Galaxy S цуврал' },
          { id: 'elec-samsung-a', name: 'Galaxy A цуврал' },
          { id: 'elec-samsung-z', name: 'Galaxy Z (Fold/Flip)' },
          { id: 'elec-samsung-other', name: 'Бусад Samsung' },
        ]},
        { id: 'elec-phone-huawei', name: 'Huawei', children: [
          { id: 'elec-huawei-p', name: 'P цуврал' },
          { id: 'elec-huawei-mate', name: 'Mate цуврал' },
          { id: 'elec-huawei-nova', name: 'Nova цуврал' },
          { id: 'elec-huawei-other', name: 'Бусад Huawei' },
        ]},
        { id: 'elec-phone-xiaomi', name: 'Xiaomi / Redmi', children: [
          { id: 'elec-xiaomi-14', name: 'Xiaomi 14 цуврал' },
          { id: 'elec-xiaomi-redmi', name: 'Redmi Note цуврал' },
          { id: 'elec-xiaomi-poco', name: 'POCO цуврал' },
          { id: 'elec-xiaomi-other', name: 'Бусад Xiaomi' },
        ]},
        { id: 'elec-phone-oppo', name: 'OPPO / Realme', children: [
          { id: 'elec-oppo-find', name: 'Find цуврал' },
          { id: 'elec-oppo-reno', name: 'Reno цуврал' },
          { id: 'elec-realme-gt', name: 'Realme GT' },
          { id: 'elec-oppo-other', name: 'Бусад' },
        ]},
        { id: 'elec-phone-other', name: 'Бусад брэнд' },
        { id: 'elec-phone-acc', name: 'Утасны тоноглол', children: [
          { id: 'elec-phoneacc-case', name: 'Гэр, хамгаалалтын шил' },
          { id: 'elec-phoneacc-charger', name: 'Цэнэглэгч' },
          { id: 'elec-phoneacc-other', name: 'Бусад тоноглол' },
        ]},
      ]},
      { id: 'elec-computer', name: 'Компьютер', children: [
        { id: 'elec-laptop', name: 'Ноутбүк', children: [
          { id: 'elec-laptop-apple', name: 'Apple MacBook' },
          { id: 'elec-laptop-lenovo', name: 'Lenovo' },
          { id: 'elec-laptop-hp', name: 'HP' },
          { id: 'elec-laptop-dell', name: 'Dell' },
          { id: 'elec-laptop-asus', name: 'ASUS' },
          { id: 'elec-laptop-acer', name: 'Acer' },
          { id: 'elec-laptop-msi', name: 'MSI' },
          { id: 'elec-laptop-other', name: 'Бусад' },
        ]},
        { id: 'elec-desktop', name: 'Desktop компьютер' },
        { id: 'elec-tablet', name: 'Tablet', children: [
          { id: 'elec-tablet-ipad', name: 'iPad' },
          { id: 'elec-tablet-samsung', name: 'Samsung Tab' },
          { id: 'elec-tablet-other', name: 'Бусад' },
        ]},
        { id: 'elec-monitor', name: 'Монитор, дэлгэц' },
        { id: 'elec-printer', name: 'Принтер, сканнер' },
        { id: 'elec-comp-parts', name: 'Сэлбэг тоноглол', children: [
          { id: 'elec-parts-ram', name: 'RAM' },
          { id: 'elec-parts-ssd', name: 'SSD / HDD' },
          { id: 'elec-parts-gpu', name: 'График карт' },
          { id: 'elec-parts-keyboard', name: 'Клавиатур, хулгана' },
          { id: 'elec-parts-other', name: 'Бусад сэлбэг' },
        ]},
        { id: 'elec-comp-other', name: 'Бусад компьютер' },
      ]},
      { id: 'elec-tv', name: 'Зурагт (TV)', children: [
        { id: 'elec-tv-samsung', name: 'Samsung' },
        { id: 'elec-tv-lg', name: 'LG' },
        { id: 'elec-tv-sony', name: 'Sony' },
      { id: 'elec-tv-xiaomi', name: 'Xiaomi TV' },
      { id: 'elec-tv-tcl', name: 'TCL / Hisense' },
      { id: 'elec-tv-other', name: 'Бусад' },
      ]},
      { id: 'elec-audio', name: 'Аудио', children: [
        { id: 'elec-audio-earphone', name: 'Чихэвч (AirPods, JBL, Sony)' },
        { id: 'elec-audio-speaker', name: 'Чанга яригч (speaker)' },
        { id: 'elec-audio-other', name: 'Бусад аудио' },
      ]},
      { id: 'elec-projector', name: 'Проектор' },
      { id: 'elec-camera', name: 'Зургийн аппарат', children: [
        { id: 'elec-camera-dslr', name: 'Camera (Canon, Nikon, Sony)' },
        { id: 'elec-camera-drone', name: 'Drone' },
        { id: 'elec-camera-gopro', name: 'GoPro / Action cam' },
        { id: 'elec-camera-lens', name: 'Линз' },
        { id: 'elec-camera-tripod', name: 'Тавиур (tripod)' },
        { id: 'elec-camera-acc', name: 'Бусад тоноглол' },
      ]},
      { id: 'elec-gaming', name: 'Тоглоомын консол', children: [
        { id: 'elec-gaming-ps', name: 'PlayStation (PS4, PS5)' },
        { id: 'elec-gaming-xbox', name: 'Xbox' },
        { id: 'elec-gaming-switch', name: 'Nintendo Switch' },
        { id: 'elec-gaming-acc', name: 'Тоглоомын дагалдах' },
      ]},
      { id: 'elec-smartwatch', name: 'Smart watch' },
      { id: 'elec-ereader', name: 'E-reader' },
      { id: 'elec-other', name: 'Бусад электроник' },
    ],
  },

  // ══════════════════════════════════════
  // 4. ХУВЦАС
  // ══════════════════════════════════════
  {
    id: 'clothing', name: 'Хувцас', icon: 'shirt',
    children: [
      { id: 'cloth-men', name: 'Эрэгтэй хувцас', children: [
        { id: 'cloth-men-shirt', name: 'Цамц, реништка' },
        { id: 'cloth-men-pants', name: 'Өмд' },
        { id: 'cloth-men-jeans', name: 'Жинс' },
        { id: 'cloth-men-suit', name: 'Костюм' },
        { id: 'cloth-men-winter', name: 'Гадуур хувцас (куртка, пальто)' },
        { id: 'cloth-men-other', name: 'Бусад эрэгтэй' },
      ]},
      { id: 'cloth-women', name: 'Эмэгтэй хувцас', children: [
        { id: 'cloth-women-shirt', name: 'Цамц' },
        { id: 'cloth-women-skirt', name: 'Юбка, даашинз' },
        { id: 'cloth-women-pants', name: 'Жинс, өмд' },
        { id: 'cloth-women-dress', name: 'Платье' },
        { id: 'cloth-women-winter', name: 'Гадуур хувцас' },
        { id: 'cloth-women-other', name: 'Бусад эмэгтэй' },
      ]},
      { id: 'cloth-shoes', name: 'Гутал', children: [
        { id: 'cloth-shoes-men', name: 'Эрэгтэй гутал' },
        { id: 'cloth-shoes-women', name: 'Эмэгтэй гутал' },
        { id: 'cloth-shoes-sport', name: 'Спорт гутал', children: [
          { id: 'cloth-shoes-nike', name: 'Nike' },
          { id: 'cloth-shoes-adidas', name: 'Adidas' },
          { id: 'cloth-shoes-nb', name: 'New Balance' },
          { id: 'cloth-shoes-puma', name: 'Puma' },
        { id: 'cloth-shoes-jordan', name: 'Jordan' },
        { id: 'cloth-shoes-converse', name: 'Converse' },
        { id: 'cloth-shoes-brand-other', name: 'Бусад брэнд' },
        ]},
        { id: 'cloth-shoes-winter', name: 'Өвлийн гутал' },
        { id: 'cloth-shoes-other', name: 'Бусад гутал' },
      ]},
      { id: 'cloth-kids', name: 'Хүүхдийн хувцас' },
      { id: 'cloth-bag', name: 'Цүнх, тоноглол', children: [
        { id: 'cloth-bag-men', name: 'Цүнх (эрэгтэй)' },
        { id: 'cloth-bag-women', name: 'Цүнх (эмэгтэй)' },
        { id: 'cloth-bag-belt', name: 'Бүс' },
        { id: 'cloth-bag-hat', name: 'Малгай' },
        { id: 'cloth-bag-scarf', name: 'Гүдний шил' },
        { id: 'cloth-bag-gloves', name: 'Бээлий' },
        { id: 'cloth-bag-other', name: 'Бусад тоноглол' },
      ]},
      { id: 'cloth-underwear', name: 'Дотуур хувцас' },
      { id: 'cloth-sportswear', name: 'Спорт хувцас' },
      { id: 'cloth-deel', name: 'Монгол дээл' },
      { id: 'cloth-secondhand', name: 'Хуучин хувцас (second hand)' },
      { id: 'cloth-other', name: 'Бусад хувцас' },
    ],
  },

  // ══════════════════════════════════════
  // 5. ХҮНС
  // ══════════════════════════════════════
  {
    id: 'food', name: 'Хүнс', icon: 'nutrition',
    children: [
      { id: 'food-meat', name: 'Мах, махан бүтээгдэхүүн', children: [
        { id: 'food-meat-beef', name: 'Үхрийн мах' },
        { id: 'food-meat-mutton', name: 'Хонины мах' },
        { id: 'food-meat-goat', name: 'Ямааны мах' },
        { id: 'food-meat-chicken', name: 'Тахианы мах' },
        { id: 'food-meat-processed', name: 'Боловсруулсан мах' },
      ]},
      { id: 'food-dairy', name: 'Сүү, сүүн бүтээгдэхүүн' },
      { id: 'food-veggie', name: 'Жимс, ногоо' },
      { id: 'food-grain', name: 'Буурил, будаа, талх' },
      { id: 'food-drink', name: 'Цай, кофе, ундаа', children: [
        { id: 'food-drink-tea', name: 'Цай' },
        { id: 'food-drink-coffee', name: 'Кофе' },
        { id: 'food-drink-juice', name: 'Шүүс' },
        { id: 'food-drink-water', name: 'Ус' },
        { id: 'food-drink-other', name: 'Бусад ундаа' },
      ]},
      { id: 'food-snack', name: 'Амттан, зууш' },
      { id: 'food-organic', name: 'Органик хүнс' },
      { id: 'food-frozen', name: 'Хөлдөөсөн хүнс' },
      { id: 'food-baby', name: 'Нярайн хүнс' },
      { id: 'food-supplement', name: 'Хүнсний нэмэлт (vitamin, supplement)' },
      { id: 'food-other', name: 'Бусад хүнс' },
    ],
  },

  // ══════════════════════════════════════
  // 6. ГОО САЙХАН
  // ══════════════════════════════════════
  {
    id: 'beauty', name: 'Гоо сайхан', icon: 'sparkles',
    children: [
      { id: 'beauty-skin', name: 'Нүүрний арьс хандлага', children: [
        { id: 'beauty-skin-moisturizer', name: 'Чийгшүүлэгч' },
        { id: 'beauty-skin-cream', name: 'Нүүрний тос' },
        { id: 'beauty-skin-cleanser', name: 'Нүүр угаагч' },
        { id: 'beauty-skin-mask', name: 'Маск' },
        { id: 'beauty-skin-other', name: 'Бусад' },
      ]},
      { id: 'beauty-hair', name: 'Үсний арьс хандлага', children: [
        { id: 'beauty-hair-shampoo', name: 'Шампунь' },
        { id: 'beauty-hair-conditioner', name: 'Кондиционер' },
        { id: 'beauty-hair-treatment', name: 'Үсний тос' },
        { id: 'beauty-hair-other', name: 'Бусад' },
      ]},
      { id: 'beauty-body', name: 'Биеийн арьс хандлага' },
      { id: 'beauty-makeup', name: 'Хүмэл (makeup)', children: [
        { id: 'beauty-makeup-foundation', name: 'Нүүрний будаг (foundation)' },
        { id: 'beauty-makeup-lips', name: 'Уруулын будаг' },
        { id: 'beauty-makeup-eyes', name: 'Нүдний хүмэл' },
        { id: 'beauty-makeup-brow', name: 'Хөмсөг' },
        { id: 'beauty-makeup-nail', name: 'Хумсны будаг' },
        { id: 'beauty-makeup-other', name: 'Бусад хүмэл' },
      ]},
      { id: 'beauty-perfume', name: 'Үнэрт ус (perfume)' },
      { id: 'beauty-health', name: 'Эрүүл мэндийн бүтээгдэхүүн' },
      { id: 'beauty-other', name: 'Бусад гоо сайхан' },
    ],
  },

  // ══════════════════════════════════════
  // 7. ГЭР АХУЙ
  // ══════════════════════════════════════
  {
    id: 'home', name: 'Гэр ахуй', icon: 'bed',
    children: [
      { id: 'home-furniture', name: 'Тавилга', children: [
        { id: 'home-furn-sofa', name: 'Диван' },
        { id: 'home-furn-bed', name: 'Ор' },
        { id: 'home-furn-desk', name: 'Ширээ' },
        { id: 'home-furn-chair', name: 'Сандал' },
        { id: 'home-furn-cabinet', name: 'Шүүгээ' },
        { id: 'home-furn-other', name: 'Бусад тавилга' },
      ]},
      { id: 'home-kitchen', name: 'Гал тогооны тоноглол', children: [
        { id: 'home-kitchen-pot', name: 'Тогоо, тавага' },
        { id: 'home-kitchen-cup', name: 'Аяга, таваг' },
        { id: 'home-kitchen-utensil', name: 'Хүнсэл, талбага' },
        { id: 'home-kitchen-other', name: 'Бусад' },
      ]},
      { id: 'home-appliance', name: 'Гэр ахуйн цахилгаан бараа', children: [
        { id: 'home-appl-washer', name: 'Угаалгын машин' },
        { id: 'home-appl-vacuum', name: 'Тоосог сорогч' },
        { id: 'home-appl-fridge', name: 'Хөлдөгч' },
        { id: 'home-appl-ac', name: 'Кондиционер' },
        { id: 'home-appl-purifier', name: 'Агаар цэвэршүүлэгч' },
        { id: 'home-appl-other', name: 'Бусад' },
      ]},
      { id: 'home-decor', name: 'Гэрийн чимэглэл', children: [
        { id: 'home-decor-carpet', name: 'Хивс, хөнжил' },
        { id: 'home-decor-curtain', name: 'Хөшигтүүлэг' },
        { id: 'home-decor-art', name: 'Зураг, хүрээ' },
        { id: 'home-decor-other', name: 'Бусад' },
      ]},
      { id: 'home-lighting', name: 'Гэрэлтүүлэг' },
      { id: 'home-bathroom', name: 'Угаалгын өрөөний тоноглол' },
      { id: 'home-garden', name: 'Цэцэрлэг, зүлэг' },
      { id: 'home-cleaning', name: 'Цэвэрлэгээний бараа' },
      { id: 'home-other', name: 'Бусад гэр ахуй' },
    ],
  },

  // ══════════════════════════════════════
  // 8. СПОРТ, ИДЭВХТЭЙ
  // ══════════════════════════════════════
  {
    id: 'sport', name: 'Спорт, Идэвхтэй', icon: 'fitness',
    children: [
      { id: 'sport-clothing', name: 'Спортын хувцас', children: [
        { id: 'sport-cloth-men', name: 'Эрэгтэй' },
        { id: 'sport-cloth-women', name: 'Эмэгтэй' },
        { id: 'sport-cloth-kids', name: 'Хүүхдийн' },
      ]},
      { id: 'sport-equipment', name: 'Спортын тоног төхөөрөмж', children: [
        { id: 'sport-equip-fitness', name: 'Фитнесс төхөөрөмж' },
        { id: 'sport-equip-ball', name: 'Бөх, зөөлөн бөмбөг' },
        { id: 'sport-equip-tennis', name: 'Теннис, бадминтон' },
        { id: 'sport-equip-other', name: 'Бусад төхөөрөмж' },
      ]},
      { id: 'sport-outdoor', name: 'Гадаа амралт (outdoor)', children: [
        { id: 'sport-outdoor-camp', name: 'Кемпинг тоноглол' },
        { id: 'sport-outdoor-fish', name: 'Загасчлал' },
        { id: 'sport-outdoor-hunt', name: 'Ангийн тоноглол' },
        { id: 'sport-outdoor-other', name: 'Бусад' },
      ]},
      { id: 'sport-bike', name: 'Дугуй', children: [
        { id: 'sport-bike-mountain', name: 'Уулын дугуй' },
        { id: 'sport-bike-road', name: 'Замын дугуй' },
        { id: 'sport-bike-ebike', name: 'Цахилгаан дугуй (e-bike)' },
        { id: 'sport-bike-parts', name: 'Дугуйн сэлбэг' },
        { id: 'sport-bike-other', name: 'Бусад' },
      ]},
      { id: 'sport-winter', name: 'Өвлийн спорт', children: [
        { id: 'sport-winter-ski', name: 'Цана' },
        { id: 'sport-winter-snowboard', name: 'Сноуборд' },
        { id: 'sport-winter-skate', name: 'Мөсөн гулгуур' },
      ]},
      { id: 'sport-martial', name: 'Тулааны спорт', children: [
        { id: 'sport-martial-boxing', name: 'Бокс' },
        { id: 'sport-martial-wrestling', name: 'Бөх' },
        { id: 'sport-martial-judo', name: 'Жүдо' },
        { id: 'sport-martial-other', name: 'Бусад' },
      ]},
      { id: 'sport-water', name: 'Усны спорт', children: [
        { id: 'sport-water-swim', name: 'Усанд сэлэлт' },
        { id: 'sport-water-kayak', name: 'Каяк' },
        { id: 'sport-water-other', name: 'Бусад' },
      ]},
      { id: 'sport-other', name: 'Бусад спорт' },
    ],
  },

  // ══════════════════════════════════════
  // 9. ХҮҮХДИЙН
  // ══════════════════════════════════════
  {
    id: 'kids', name: 'Хүүхдийн', icon: 'happy',
    children: [
      { id: 'kids-clothing', name: 'Хүүхдийн хувцас', children: [
        { id: 'kids-cloth-baby', name: 'Бэлх (0-1 нас)' },
        { id: 'kids-cloth-toddler', name: 'Бага нас (1-4)' },
        { id: 'kids-cloth-child', name: 'Хүүхэд (4-12)' },
        { id: 'kids-cloth-teen', name: 'Өсвөр нас (12-16)' },
      ]},
      { id: 'kids-toys', name: 'Тоглоом', children: [
        { id: 'kids-toys-educational', name: 'Боловсролын тоглоом' },
        { id: 'kids-toys-lego', name: 'LEGO' },
        { id: 'kids-toys-puzzle', name: 'Чихэлдэг тоглоом' },
        { id: 'kids-toys-rc', name: 'Робот / RC машин' },
        { id: 'kids-toys-other', name: 'Бусад тоглоом' },
      ]},
      { id: 'kids-furniture', name: 'Хүүхдийн тавилга', children: [
        { id: 'kids-furn-bed', name: 'Ор' },
        { id: 'kids-furn-stroller', name: 'Суудал' },
        { id: 'kids-furn-desk', name: 'Ширээ' },
        { id: 'kids-furn-other', name: 'Бусад' },
      ]},
      { id: 'kids-school', name: 'Хүүхдийн сургуулийн' },
      { id: 'kids-care', name: 'Хүүхдийн арьс хандлага, тоол', children: [
        { id: 'kids-care-diaper', name: 'Нэлэнхүй тоол' },
        { id: 'kids-care-formula', name: 'Гүлимь' },
        { id: 'kids-care-hygiene', name: 'Ариун хандлага' },
        { id: 'kids-care-other', name: 'Бусад' },
      ]},
      { id: 'kids-other', name: 'Бусад хүүхдийн' },
    ],
  },

  // ══════════════════════════════════════
  // 10. АЖЛЫН ЗАР ★ШИНЭ
  // ══════════════════════════════════════
  {
    id: 'jobs', name: 'Ажлын зар', icon: 'briefcase',
    children: [
      { id: 'jobs-hire', name: 'Ажилд авна', children: [
        { id: 'jobs-hire-engineer', name: 'Инженер, техник' },
        { id: 'jobs-hire-it', name: 'IT, программ' },
        { id: 'jobs-hire-marketing', name: 'Борлуулалт, маркетинг' },
        { id: 'jobs-hire-finance', name: 'Санхүү, нягтлан' },
        { id: 'jobs-hire-service', name: 'Үйлчилгээ, зочид буудал' },
        { id: 'jobs-hire-construction', name: 'Барилга' },
        { id: 'jobs-hire-health', name: 'Эрүүл мэнд' },
        { id: 'jobs-hire-education', name: 'Боловсрол' },
        { id: 'jobs-hire-driver', name: 'Жолооч' },
        { id: 'jobs-hire-factory', name: 'Агуулах, үйлдвэр' },
        { id: 'jobs-hire-other', name: 'Бусад ажлын байр' },
      ]},
      { id: 'jobs-seek', name: 'Ажил хайна' },
      { id: 'jobs-freelance', name: 'Фрилансер' },
      { id: 'jobs-parttime', name: 'Цагийн ажил' },
      { id: 'jobs-internship', name: 'Дадлага' },
    ],
  },

  // ══════════════════════════════════════
  // 11. БАРИЛГА, ИНТЕРЬЕР
  // ══════════════════════════════════════
  {
    id: 'construction', name: 'Барилга, Интерьер', icon: 'construct',
    children: [
      { id: 'const-material', name: 'Барилгын материал', children: [
        { id: 'const-mat-cement', name: 'Цемент, бетон' },
        { id: 'const-mat-brick', name: 'Тоосго, блок' },
        { id: 'const-mat-wood', name: 'Модон материал' },
        { id: 'const-mat-insulation', name: 'Дулаалгын материал' },
        { id: 'const-mat-metal', name: 'Арсвэр' },
        { id: 'const-mat-other', name: 'Бусад' },
      ]},
      { id: 'const-tools', name: 'Төхөөрөмж, багаж', children: [
        { id: 'const-tools-electric', name: 'Цахилгаан багаж' },
        { id: 'const-tools-hand', name: 'Нагнуурын багаж' },
        { id: 'const-tools-machine', name: 'Барилгын төхөөрөмж' },
        { id: 'const-tools-other', name: 'Бусад' },
      ]},
      { id: 'const-finish', name: 'Засварын материал', children: [
        { id: 'const-finish-paint', name: 'Будаг' },
        { id: 'const-finish-tile', name: 'Хавтан тааз' },
        { id: 'const-finish-floor', name: 'Шалны материал' },
        { id: 'const-finish-other', name: 'Бусад' },
      ]},
      { id: 'const-plumbing', name: 'Түлш', children: [
        { id: 'const-plumb-pipe', name: 'Гүүрс' },
        { id: 'const-plumb-heating', name: 'Хаагуур түлш' },
        { id: 'const-plumb-other', name: 'Бусад' },
      ]},
      { id: 'const-electrical', name: 'Цахилгааны тоноглол', children: [
        { id: 'const-elec-wire', name: 'Утас, кабель' },
        { id: 'const-elec-switch', name: 'Залгуур, унтраалга' },
        { id: 'const-elec-panel', name: 'Самбар' },
        { id: 'const-elec-other', name: 'Бусад' },
      ]},
      { id: 'const-window', name: 'Цонх, хаалга', children: [
        { id: 'const-window-plastic', name: 'Хуванцар цонх' },
        { id: 'const-window-door', name: 'Хаалга' },
        { id: 'const-window-other', name: 'Бусад' },
      ]},
      { id: 'const-other', name: 'Бусад барилга' },
    ],
  },

  // ══════════════════════════════════════
  // 12. ДИЖИТАЛ БАРАА
  // ══════════════════════════════════════
  {
    id: 'digital', name: 'Дижитал бараа', icon: 'cloud-download',
    children: [
      { id: 'digital-content', name: 'Дижитал контент', children: [
        { id: 'digital-ebook', name: 'E-book' },
        { id: 'digital-course', name: 'Онлайн курс' },
        { id: 'digital-template', name: 'Дизайн загвар (template)' },
        { id: 'digital-media', name: 'Фото, видео материал' },
        { id: 'digital-content-other', name: 'Бусад' },
      ]},
      { id: 'digital-software', name: 'Программ хангамж', children: [
        { id: 'digital-sw-app', name: 'App / мобайл апп' },
        { id: 'digital-sw-license', name: 'License key' },
        { id: 'digital-sw-plugin', name: 'Plugin, өргөтгөл' },
        { id: 'digital-sw-other', name: 'Бусад' },
      ]},
      { id: 'digital-domain', name: 'Домэйн, хостинг' },
      { id: 'digital-gaming', name: 'Тоглоомын аккаунт, код' },
      { id: 'digital-crypto', name: 'Крипто, NFT' },
      { id: 'digital-other', name: 'Бусад дижитал' },
    ],
  },

  // ══════════════════════════════════════
  // 13. НОМ
  // ══════════════════════════════════════
  {
    id: 'books', name: 'Ном', icon: 'book',
    children: [
      { id: 'books-textbook', name: 'Сурах бичиг', children: [
        { id: 'books-text-primary', name: 'Бага анги (1-5-р анги)' },
        { id: 'books-text-middle', name: 'Дунд анги (6-9-р анги)' },
        { id: 'books-text-high', name: 'Ахлах анги (10-12-р анги)' },
        { id: 'books-text-supplies', name: 'Бэ тоноглол' },
      ]},
      { id: 'books-literature', name: 'Уран зохиол' },
      { id: 'books-professional', name: 'Мэргэжлийн ном', children: [
        { id: 'books-pro-it', name: 'IT, программ' },
        { id: 'books-pro-business', name: 'Бизнес, менежмент' },
        { id: 'books-pro-health', name: 'Эрүүл мэнд' },
        { id: 'books-pro-other', name: 'Бусад' },
      ]},
      { id: 'books-kids', name: 'Хүүхдийн ном' },
      { id: 'books-stationery', name: 'Бичгийн тоноглол' },
      { id: 'books-other', name: 'Бусад ном' },
    ],
  },

  // ══════════════════════════════════════
  // 14. ЦАГАС, ЧИМЭГЛЭЛ
  // ══════════════════════════════════════
  {
    id: 'jewelry', name: 'Цагас, Чимэглэл', icon: 'diamond',
    children: [
      { id: 'jewelry-gold', name: 'Алтан эдлэл', children: [
        { id: 'jewelry-gold-ring', name: 'Бүгж, өлгий' },
        { id: 'jewelry-gold-earring', name: 'Ээрлий' },
        { id: 'jewelry-gold-other', name: 'Бусад' },
      ]},
      { id: 'jewelry-silver', name: 'Мөнгөн эдлэл' },
      { id: 'jewelry-watch', name: 'Цаг', children: [
        { id: 'jewelry-watch-men', name: 'Эрэгтэй' },
        { id: 'jewelry-watch-women', name: 'Эмэгтэй' },
        { id: 'jewelry-watch-smart', name: 'Smart watch' },
        { id: 'jewelry-watch-other', name: 'Бусад' },
      ]},
      { id: 'jewelry-costume', name: 'Гоёлын чимэглэл' },
      { id: 'jewelry-repair', name: 'Алт, мөнгө засвар' },
      { id: 'jewelry-other', name: 'Бусад чимэглэл' },
    ],
  },

  // ══════════════════════════════════════
  // 15. АМЬТАН
  // ══════════════════════════════════════
  {
    id: 'pets', name: 'Амьтан', icon: 'paw',
    children: [
      { id: 'pets-animal', name: 'Тэжээвэр амьтан', children: [
        { id: 'pets-dog', name: 'Нохой', children: [
          { id: 'pets-dog-purebred', name: 'Үүлдэр нохой' },
          { id: 'pets-dog-mixed', name: 'Эрлийз нохой' },
        ]},
        { id: 'pets-cat', name: 'Муур' },
        { id: 'pets-bird', name: 'Шувуу' },
        { id: 'pets-fish', name: 'Загас' },
        { id: 'pets-animal-other', name: 'Бусад' },
      ]},
      { id: 'pets-supplies', name: 'Тэжээвэр амьтны тоноглол', children: [
        { id: 'pets-supply-food', name: 'Тэжээл' },
        { id: 'pets-supply-toys', name: 'Тоглоом' },
        { id: 'pets-supply-house', name: 'Ор, байшин' },
        { id: 'pets-supply-other', name: 'Бусад' },
      ]},
      { id: 'pets-vet', name: 'Мал эмнэлэг' },
      { id: 'pets-grooming', name: 'Grooming үйлчилгээ' },
      { id: 'pets-other', name: 'Бусад амьтан' },
    ],
  },

  // ══════════════════════════════════════
  // 16. УРЛАГ, СОЁЛ
  // ══════════════════════════════════════
  {
    id: 'art', name: 'Урлаг, Соёл', icon: 'musical-notes',
    children: [
      { id: 'art-music', name: 'Хөгжмийн зэмсэг', children: [
        { id: 'art-music-piano', name: 'Пиано' },
        { id: 'art-music-guitar', name: 'Гитар' },
        { id: 'art-music-violin', name: 'Гүбэн' },
        { id: 'art-music-morin', name: 'Морин хуур' },
        { id: 'art-music-other', name: 'Бусад зэмсэг' },
      ]},
      { id: 'art-craft', name: 'Урлаг бүтээл', children: [
        { id: 'art-craft-painting', name: 'Зураг' },
        { id: 'art-craft-handicraft', name: 'Гарымал' },
        { id: 'art-craft-other', name: 'Бусад' },
      ]},
      { id: 'art-ticket', name: 'Билет', children: [
        { id: 'art-ticket-concert', name: 'Концерт' },
        { id: 'art-ticket-show', name: 'Тоглолт' },
        { id: 'art-ticket-sport', name: 'Спорт тэмцээн' },
        { id: 'art-ticket-other', name: 'Бусад' },
      ]},
      { id: 'art-supplies', name: 'Урлагийн хэрэгсэл', children: [
        { id: 'art-supply-paint', name: 'Будаг, бийр' },
        { id: 'art-supply-canvas', name: 'Зурагийн даавуу' },
        { id: 'art-supply-other', name: 'Бусад' },
      ]},
      { id: 'art-antique', name: 'Эртний эд зүйлс' },
      { id: 'art-other', name: 'Бусад урлаг' },
    ],
  },

  // ══════════════════════════════════════
  // 17. ХӨДӨӨ, МАЛ АЖ АХУЙ
  // ══════════════════════════════════════
  {
    id: 'rural', name: 'Хөдөө, Мал аж ахуй', icon: 'leaf',
    children: [
      { id: 'rural-livestock', name: 'Мал', children: [
        { id: 'rural-mal-ukher', name: 'Үхэр' },
        { id: 'rural-mal-aduu', name: 'Адуу' },
        { id: 'rural-mal-temee', name: 'Тэмээ' },
        { id: 'rural-mal-khoni', name: 'Хонь' },
        { id: 'rural-mal-yamaa', name: 'Ямаа' },
        { id: 'rural-mal-other', name: 'Бусад мал' },
      ]},
      { id: 'rural-plants', name: 'Ургамал', children: [
        { id: 'rural-plant-indoor', name: 'Гэрийн ургамал' },
        { id: 'rural-plant-seeds', name: 'Бүлг' },
        { id: 'rural-plant-other', name: 'Бусад' },
      ]},
      { id: 'rural-crop', name: 'Тариалан', children: [
        { id: 'rural-crop-potato', name: 'Төмс, ногоо' },
        { id: 'rural-crop-grain', name: 'Үр тариа' },
        { id: 'rural-crop-other', name: 'Бусад' },
      ]},
      { id: 'rural-dairy', name: 'Сүү, цагаан идээ үйлдвэрлэл' },
      { id: 'rural-bee', name: 'Зөгийн аж ахуй' },
      { id: 'rural-feed', name: 'Тэжээл, өвс' },
      { id: 'rural-equipment', name: 'Мал аж ахуйн төхөөрөмж', children: [
        { id: 'rural-equip-tractor', name: 'Трактор' },
        { id: 'rural-equip-harvester', name: 'Хураагч' },
        { id: 'rural-equip-irrigation', name: 'Усалгааны систем' },
        { id: 'rural-equip-other', name: 'Бусад' },
      ]},
      { id: 'rural-other', name: 'Бусад' },
    ],
  },

  // ══════════════════════════════════════
  // 18. ОФФИС, БИЗНЕС
  // ══════════════════════════════════════
  {
    id: 'office', name: 'Оффис, Бизнес', icon: 'desktop',
    children: [
      { id: 'office-furniture', name: 'Оффисын тавилга', children: [
        { id: 'office-furn-desk', name: 'Ширээ' },
        { id: 'office-furn-chair', name: 'Сандал' },
        { id: 'office-furn-cabinet', name: 'Шүүгээ' },
        { id: 'office-furn-other', name: 'Бусад' },
      ]},
      { id: 'office-tech', name: 'Оффисын техник', children: [
        { id: 'office-tech-printer', name: 'Принтер' },
        { id: 'office-tech-projector', name: 'Проектор' },
        { id: 'office-tech-phone', name: 'Утасны систем' },
        { id: 'office-tech-other', name: 'Бусад' },
      ]},
      { id: 'office-stationery', name: 'Бичгийн тоноглол' },
      { id: 'office-pos', name: 'POS систем, кассын апарат' },
      { id: 'office-safety', name: 'Аюулгүй байдал (камер, дохиолол)', children: [
        { id: 'office-safety-camera', name: 'Хяналтын камер' },
        { id: 'office-safety-alarm', name: 'Дохиоллын систем' },
        { id: 'office-safety-lock', name: 'Цоож, хандалтын систем' },
        { id: 'office-safety-other', name: 'Бусад' },
      ]},
      { id: 'office-packaging', name: 'Савлагаа, баглаа боодол' },
      { id: 'office-other', name: 'Бусад оффис' },
    ],
  },

  // ══════════════════════════════════════
  // 19. ҮЙЛЧИЛГЭЭ
  // ══════════════════════════════════════
  {
    id: 'services', name: 'Үйлчилгээ', icon: 'build',
    children: [
      { id: 'svc-it', name: 'Компьютер, интернет', children: [
        { id: 'svc-it-printer', name: 'Принтер засвар' },
        { id: 'svc-it-computer', name: 'Компьютер засвар' },
        { id: 'svc-it-software', name: 'Программ суулгана' },
        { id: 'svc-it-web', name: 'Вэбсайт, апп хийнэ' },
        { id: 'svc-it-network', name: 'Сүлжээ тавина, засвар' },
        { id: 'svc-it-other', name: 'Бусад' },
      ]},
      { id: 'svc-transport', name: 'Тээвэр, зөөлгөө', children: [
        { id: 'svc-trans-move', name: 'Нүүдэл тээвэр' },
        { id: 'svc-trans-delivery', name: 'Хүргэлт' },
        { id: 'svc-trans-cargo', name: 'Ачааны тээвэр' },
        { id: 'svc-trans-other', name: 'Бусад' },
      ]},
      { id: 'svc-repair', name: 'Засвар, үйлчилгээ', children: [
        { id: 'svc-repair-home', name: 'Гэр засвар' },
        { id: 'svc-repair-electric', name: 'Цахилгаан бараа засвар' },
        { id: 'svc-repair-plumbing', name: 'Сан техник' },
        { id: 'svc-repair-other', name: 'Бусад' },
      ]},
      { id: 'svc-education', name: 'Сургалт', children: [
        { id: 'svc-edu-english', name: 'Англи хэл' },
        { id: 'svc-edu-korean', name: 'Солонгос хэл' },
        { id: 'svc-edu-math', name: 'Математик' },
        { id: 'svc-edu-coding', name: 'Программ' },
        { id: 'svc-edu-music', name: 'Хөлөөдлого' },
        { id: 'svc-edu-other', name: 'Бусад сургалт' },
      ]},
      { id: 'svc-beauty', name: 'Гоо сайхны үйлчилгээ', children: [
        { id: 'svc-beauty-hair', name: 'Үсчин' },
        { id: 'svc-beauty-nails', name: 'Хумсны үйлчилгээ' },
        { id: 'svc-beauty-massage', name: 'Массаж' },
        { id: 'svc-beauty-other', name: 'Бусад' },
      ]},
      { id: 'svc-legal', name: 'Хуульч, хуу зүй' },
      { id: 'svc-photo', name: 'Зураг, видео зураг', children: [
        { id: 'svc-photo-photo', name: 'Гэрэл зураг' },
        { id: 'svc-photo-video', name: 'Видео зураг' },
        { id: 'svc-photo-other', name: 'Бусад' },
      ]},
      { id: 'svc-cleaning', name: 'Цэвэрлэгээ' },
      { id: 'svc-event', name: 'Арга хэмжээ зохион байгуулалт', children: [
        { id: 'svc-event-wedding', name: 'Хуримын' },
        { id: 'svc-event-birthday', name: 'Төрсөн өдрийн' },
        { id: 'svc-event-corporate', name: 'Байгууллагын' },
        { id: 'svc-event-other', name: 'Бусад' },
      ]},
      { id: 'svc-design', name: 'Дизайн үйлчилгээ', children: [
        { id: 'svc-design-graphic', name: 'График дизайн' },
        { id: 'svc-design-interior', name: 'Интерьер дизайн' },
        { id: 'svc-design-other', name: 'Бусад' },
      ]},
      { id: 'svc-translation', name: 'Орчуулга' },
      { id: 'svc-accounting', name: 'Нягтлан бодох бүртгэл' },
      { id: 'svc-other', name: 'Бусад үйлчилгээ' },
    ],
  },
];

// Helper functions
export function flattenCategories(cats: Category[], parentId?: string): (Category & { parentId?: string })[] {
  const result: (Category & { parentId?: string })[] = [];
  for (const cat of cats) {
    result.push({ ...cat, parentId, children: undefined });
    if (cat.children) result.push(...flattenCategories(cat.children, cat.id));
  }
  return result;
}

export function findCategoryById(cats: Category[], id: string): Category | null {
  for (const cat of cats) {
    if (cat.id === id) return cat;
    if (cat.children) {
      const found = findCategoryById(cat.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function getCategoryBreadcrumb(cats: Category[], id: string, path: Category[] = []): Category[] | null {
  for (const cat of cats) {
    const newPath = [...path, cat];
    if (cat.id === id) return newPath;
    if (cat.children) {
      const found = getCategoryBreadcrumb(cat.children, id, newPath);
      if (found) return found;
    }
  }
  return null;
}
