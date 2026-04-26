# 📱 ESELLER.MN — Бүрэн хуудасны танилцуулга

> Web (eseller.mn) болон Mobile (eseller-mobile) аппын **бүх хуудас** ба тэдгээрийн үүрэг.

---

# 🌐 ХЭСЭГ 1: WEB (eseller.mn)

## A. ОЛОН НИЙТИЙН ХУУДАС (Public)

### 🏠 Нүүр хуудсууд
| Хуудас | Үүрэг |
|--------|-------|
| **`/`** (Нүүр) | Hero slider, ангилал, онцлох бараа/дэлгүүр, flash sale |
| **`/store`** (Marketplace) | Бүх барааны жагсаалт, шүүлтүүр, sort |
| **`/feed`** (Зарын булан) | Хэрэглэгчдийн зарууд (Avito-loop), дүүргээр шүүх |
| **`/shops`** (Дэлгүүрүүд) | Бүх дэлгүүрийн жагсаалт, ангиллаар хуваах |
| **`/search`** | Глобал хайлт (бараа + дэлгүүр) |
| **`/compare`** | Хэд хэдэн бараа харьцуулах |
| **`/tenders`** | Засгийн газрын тендерүүд (B2G) |

### 📰 Танилцуулга & хууль
| Хуудас | Үүрэг |
|--------|-------|
| **`/about`** | Бидний тухай |
| **`/help`** | Тусламж, FAQ, заавар |
| **`/contact`** | Холбоо барих form |
| **`/privacy`** | Нууцлалын бодлого (хууль ёсны) |
| **`/terms`** | Үйлчилгээний нөхцөл |

### 💎 Гишүүнчлэл & loyalty
| Хуудас | Үүрэг |
|--------|-------|
| **`/gold`** | Gold premium гишүүнчлэлийн танилцуулга, үнэ, давуу тал |
| **`/bank-loyalty`** | Банкны оноог eSeller pointto хувиргах |
| **`/achievements`** | Хэрэглэгчийн badge, амжилтууд |

### 🔥 Flash & live
| Хуудас | Үүрэг |
|--------|-------|
| **`/live`** | Шууд дамжуулалт жагсаалт |
| **`/live/[id]`** | Live stream үзэх + чат + худалдан авах |

### 🌍 Тусгай vertical
| Хуудас | Үүрэг |
|--------|-------|
| **`/herder`** | Малчны булан — мах, сүү, ноос шууд малчнаас |
| **`/herder/[province]`** | Аймгийн малчдын бараа |
| **`/bnpl`** | Buy Now Pay Later — банкны зээл |
| **`/become-driver`** | Жолооч болох landing |
| **`/become-seller`** | Дэлгүүр нээх landing (5 алхам) |
| **`/open-shop`** | Дэлгүүр нээх дэлгэрэнгүй |
| **`/corporate-order`** | B2B/корпорацийн их захиалга |

---

## B. БАРАА & ДЭЛГҮҮР (Public)

| Хуудас | Үүрэг |
|--------|-------|
| **`/product/[id]`** | Бараа дэлгэрэнгүй (зураг, үнэ, тойм, related) |
| **`/[slug]`** | Дэлгүүрийн storefront (ялгаатай URL: shop.eseller.mn) |
| **`/s/[shopSlug]`** | Дэлгүүрийн public storefront |
| **`/s/[shopSlug]/[id]`** | Тэр дэлгүүрийн бараа дэлгэрэнгүй |
| **`/shop/[id]`** | Дэлгүүрийн profile |
| **`/seller/[username]`** | Affiliate (борлуулагч)-ийн public profile |
| **`/u/[username]`** | Хэрэглэгчийн public profile |
| **`/entity/[entityType]/[slug]`** | Multi-vertical (real estate, auto, service г.м.) |

---

## C. ХУДАЛДАН АВАГЧИЙН (Login required)

### 🛒 Худалдан авалт
| Хуудас | Үүрэг |
|--------|-------|
| **`/cart`** | Сагс — нэмсэн бараанууд, тоо, нийт |
| **`/checkout`** | Төлбөр + хүргэлт — QPay, SocialPay, Card, Cash |
| **`/orders`** | Миний захиалгын түүх |
| **`/orders/[id]`** | Захиалгын дэлгэрэнгүй + tracking |
| **`/review/[orderId]`** | Захиалгын дараа үнэлгээ өгөх |
| **`/receipt/[id]`** | eBarimt татварын баримт |
| **`/chat/[shopSlug]`** | Дэлгүүртэй чатлах |

### 🔐 Auth
| Хуудас | Үүрэг |
|--------|-------|
| **`/login`** | Нэвтрэх (email/phone + password, Google, DAN) |
| **`/register`** | Шинэ бүртгэл (4 ролоор) |
| **`/forgot-password`** | Нууц үг сэргээх (OTP илгээх) |
| **`/reset-password/[token]`** | Шинэ нууц үг тогтоох |

### 👤 Хувийн самбар (Buyer dashboard)
| Хуудас | Үүрэг |
|--------|-------|
| **`/dashboard`** | Үндсэн самбар (overview) |
| **`/dashboard/settings`** | Хэрэглэгчийн тохиргоо |
| **`/dashboard/addresses`** | Хүргэлтийн хаягууд |
| **`/dashboard/orders`** | Захиалгын түүх |
| **`/dashboard/wishlist`** | Хадгалсан бараа |
| **`/dashboard/chat`** | Чатын жагсаалт |

---

## D. ДЭЛГҮҮР ЭЗНИЙ САМБАР (60+ хуудас)

### 📊 Үндсэн самбар
| Хуудас | Үүрэг |
|--------|-------|
| **`/dashboard/store`** | Дэлгүүрийн нүүр (статистик, орлого, захиалга) |
| **`/dashboard/store/analytics`** | Худалдааны аналитик (chart, тренд) |
| **`/dashboard/store/ai-analytics`** | AI-р хийсэн дүн шинжилгээ |

### 📦 Бараа удирдлага
| Хуудас | Үүрэг |
|--------|-------|
| **`/products`** | Бүх барааны жагсаалт |
| **`/products/bulk`** | Массиар бараа оруулах (CSV) |
| **`/products/digital`** | Дижитал барааны удирдлага |
| **`/listings`** | Зарууд, агуулах |
| **`/listings/new`** | Шинэ зар нэмэх |
| **`/categories`** | Дэлгүүрийн өөрийн ангилал |
| **`/brands`** | Брэндийн жагсаалт |
| **`/inventory`** | Нөөц/агуулахын удирдлага |

### 📋 Захиалга
| Хуудас | Үүрэг |
|--------|-------|
| **`/orders`** | Дэлгүүрийн бүх захиалга |
| **`/customers`** | Худалдан авагчдын жагсаалт |
| **`/reviews`** | Үнэлгээ, тоймд хариу өгөх |
| **`/inquiries`** | Барааны асуултууд |
| **`/waitlist`** | Хүлээгдэж буй захиалгууд |

### 💰 Санхүү
| Хуудас | Үүрэг |
|--------|-------|
| **`/wallet`** | Дэлгүүрийн данс |
| **`/deposits`** | Цэнэглэлт |
| **`/revenue`** | Орлого тайлан |
| **`/commissions`** | Комиссны жагсаалт |

### 🎯 Маркетинг
| Хуудас | Үүрэг |
|--------|-------|
| **`/campaigns`** | Email/SMS campaign |
| **`/promotions`** | Урамшуулал |
| **`/promo-codes`** | Купон код |
| **`/promote`** | Бараа онцлох (төлбөртэй) |
| **`/marketing`** | Маркетингийн tools |

### 🏬 Storefront
| Хуудас | Үүрэг |
|--------|-------|
| **`/storefront-config`** | Дэлгүүрийн харагдац тохируулах |
| **`/storefront-editor`** | Visual builder |
| **`/themes`** | Загвар сонгох |
| **`/gallery`** | Зургийн галерэй |
| **`/blog`** | Блог нийтлэл |
| **`/catalog`** | Каталог |

### 🤖 AI хэрэгслүүд
| Хуудас | Үүрэг |
|--------|-------|
| **`/ai-description`** | AI бараагийн тайлбар бичих |
| **`/ai-logo`** | AI лого үүсгэх |
| **`/ai-poster`** | AI poster дизайн |

### ⚙️ Тохиргоо
| Хуудас | Үүрэг |
|--------|-------|
| **`/settings`** | Дэлгүүрийн тохиргоо |
| **`/settings/domain`** | Custom domain |
| **`/settings/shop-type`** | Дэлгүүрийн төрөл |
| **`/working-hours`** | Ажлын цаг |
| **`/locations`** | Олон салбар |
| **`/branches`** | Салбарууд |
| **`/team`** / **`/staff`** | Ажилтан удирдлага |
| **`/licenses`** | Лиценз |
| **`/notifications`** | Мэдэгдэл |
| **`/onboarding`** | Setup wizard |

### 🚚 Логистик
| Хуудас | Үүрэг |
|--------|-------|
| **`/calendar`** | Календарь |
| **`/queue`** | Дараалал |
| **`/bookings`** | Үйлчилгээний цаг товлолт |
| **`/appointments`** | Уулзалтын цаг |

### 🎁 Vertical-тусгай
| Хуудас | Үүрэг |
|--------|-------|
| **`/vehicles`** | Машины зар (auto dealer) |
| **`/test-drives`** | Туршилтын жолоодлого |
| **`/projects`** | Барилгын төсөл |
| **`/batches`** | Pre-order batch |
| **`/services`** | Үйлчилгээний жагсаалт |
| **`/service-categories`** | Үйлчилгээний ангилал |

### 🔌 Интеграц
| Хуудас | Үүрэг |
|--------|-------|
| **`/integrations`** | Гадны API холбох |
| **`/dropship`** | Dropshipping (AliExpress, CJ) |
| **`/giftcards`** | Бэлэгний карт |
| **`/documents`** / **`/downloads`** | Файлын удирдлага |

### 💬 Чат
| Хуудас | Үүрэг |
|--------|-------|
| **`/chat`** | Дэлгүүрийн чатууд |
| **`/chat-settings`** | Чатын тохиргоо |

---

## E. БОРЛУУЛАГЧ (AFFILIATE) САМБАР

| Хуудас | Үүрэг |
|--------|-------|
| **`/dashboard/seller`** | Affiliate-ийн нүүр |
| **`/dashboard/seller/products`** | Зарж болох бараанууд |
| **`/dashboard/seller/earnings`** | Олсон комисс |
| **`/dashboard/seller/commissions`** | Комиссны түүх |
| **`/dashboard/affiliate/marketing`** | Маркетингийн материал (banner, link) |
| **`/dashboard/affiliate/wallet`** | Хэтэвч + payout |
| **`/dashboard/affiliate/verify`** | Verify статус |
| **`/dashboard/affiliate/influencer-apply`** | Influencer-ийн өргөдөл |

---

## F. ЖОЛООЧИЙН САМБАР

| Хуудас | Үүрэг |
|--------|-------|
| **`/dashboard/delivery`** | Жолоочийн нүүр |
| **`/dashboard/delivery/active`** | Идэвхтэй хүргэлт |
| **`/dashboard/delivery/history`** | Хүргэлтийн түүх |
| **`/dashboard/delivery/earnings`** | Орлого |

---

## G. АДМИН ХЭСЭГ (40+ хуудас — зөвхөн админ)

### 👥 Хэрэглэгч/дэлгүүрийн удирдлага
- `/admin/users` — хэрэглэгч
- `/admin/shops` — дэлгүүр (block, plan, commission)
- `/admin/sellers` — affiliate
- `/admin/entities` — multi-entity
- `/admin/products` — бараа
- `/admin/categories` — ангилал
- `/admin/categories/requests` — ангиллын хүсэлт

### 💸 Санхүү
- `/admin/orders` — захиалгын хяналт
- `/admin/revenue` — Платформын орлого
- `/admin/commission` — Комиссны дүрэм
- `/admin/disputes` — Маргаан шийдэх
- `/admin/returns` — Буцаалт
- `/admin/vat-monitor` — VAT хяналт

### 📊 Аналитик
- `/admin/analytics-dashboard`
- `/admin/kpi`
- `/admin/stats`

### 🎨 Контент
- `/admin/banners` — banner CRUD
- `/admin/announcements` — зар
- `/admin/homepage` — нүүр хуудсаа CMS
- `/admin/influencers` — Influencer batiging

### 🤝 Партнёр & enterprise
- `/admin/partners` — партнёр компани
- `/admin/partners/agents` — агентууд
- `/admin/enterprise` — enterprise клиент
- `/admin/tenders` — тендер удирдлага

### ⚙️ Систем
- `/admin/config` — конфигуратц
- `/admin/site-settings` — site-wide
- `/admin/system-settings` — system rules
- `/admin/maintenance` — maintenance mode
- `/admin/logs` — admin лог
- `/admin/ai` — AI insight
- `/admin/chat-monitor` — чат хяналт
- `/admin/locations` — байршил
- `/admin/live-plans` — Live plan үнэ

---

# 📱 ХЭСЭГ 2: MOBILE APP (eseller-mobile)

## A. AUTH (Нэвтрэлт) — `(auth)` group

| Дэлгэц | Үүрэг |
|--------|-------|
| **`login`** | Утас/email + password нэвтрэх |
| **`register`** | Шинэ бүртгэл (4 ролоор) |
| **`otp`** | OTP код баталгаажуулах |
| **`forgot-password`** | Нууц үг сэргээх |

---

## B. ҮНДСЭН TAB-УУД — `(tabs)` group (role-аар динамик)

### Buyer-ийн tab-ууд:
| Tab | Үүрэг |
|-----|-------|
| **Нүүр** (`index`) | Hero, ангилал, онцлох бараа, live carousel, social feed, малчны булан |
| **Хайлт** (`search`) | Бараа хайх |
| **Нэмэх** (`action`) | + товч (зар нэмэх, post үүсгэх) |
| **Захиалга** (`orders`) | Миний захиалга |
| **Би** (`profile`) | Профайл, тохиргоо |

### Store-ийн tab-ууд:
| Tab | Үүрэг |
|-----|-------|
| **Самбар** (`index`) | Дэлгүүрийн dashboard |
| **Бараа** (`store`) | Барааны удирдлага |
| **Захиалга** (`feed`) | Хүлээн авсан захиалга |
| **Чат** (`chat`) | Чат |
| **Профайл** (`profile`) | Профайл |

---

## C. ХУДАЛДАН АВАГЧИЙН — `(customer)` group (35+ дэлгэц)

### Хэтэвч & loyalty
| Дэлгэц | Үүрэг |
|--------|-------|
| **`wallet`** | Үлдэгдэл, цэнэглэлт, түүх |
| **`coupons`** | Купонууд |
| **`tier-details`** | Loyalty tier дэлгэрэнгүй |
| **`achievements`** | Badge амжилт |
| **`bnpl`** | Buy Now Pay Later |

### Хувийн мэдээлэл
| Дэлгэц | Үүрэг |
|--------|-------|
| **`addresses`** | Хүргэлтийн хаяг |
| **`edit-profile`** | Профайл засах |
| **`security`** | Аюулгүй байдал |
| **`notification-settings`** | Мэдэгдлийн тохиргоо |
| **`returns`** | Буцаалт |
| **`wishlist`** | Хадгалсан бараа |

### Барааны discovery
| Дэлгэц | Үүрэг |
|--------|-------|
| **`shops`** | Дэлгүүрийн жагсаалт |
| **`flash-sale`** | Flash sale бараа |
| **`compare`** | Бараа харьцуулах |
| **`tenders`** | Тендер |

### Контент үүсгэх
| Дэлгэц | Үүрэг |
|--------|-------|
| **`create-post`** | Social post бичих |
| **`corporate-order`** | B2B захиалга |

### Бизнес болох
| Дэлгэц | Үүрэг |
|--------|-------|
| **`become-seller`** | Дэлгүүр эзэн болох |
| **`become-driver`** | Жолооч болох (form-той) |
| **`become-herder`** | Малчин болох |
| **`register-shop`** | Дэлгүүр бүртгэх |
| **`register-herder`** | Малчин бүртгэх |

### Live & dropship
| Дэлгэц | Үүрэг |
|--------|-------|
| **`live`** | Live stream жагсаалт |
| **`live/[id]`** | Live stream үзэх |
| **`dropship`** | AliExpress/CJ дээрээс бараа import |

### Малчны булан
| Дэлгэц | Үүрэг |
|--------|-------|
| **`herder`** | Малчны marketplace |
| **`herder-product/[id]`** | Малын бүтээгдэхүүн дэлгэрэнгүй |
| **`herder-profile/[id]`** | Малчны profile |
| **`herder-review/[orderId]`** | Үнэлгээ өгөх |

### AI & туслах
| Дэлгэц | Үүрэг |
|--------|-------|
| **`ai-shopper`** | AI shopping assistant |

### Хууль & тусламж
| Дэлгэц | Үүрэг |
|--------|-------|
| **`legal/privacy`** | Нууцлалын бодлого |
| **`legal/terms`** | Үйлчилгээний нөхцөл |
| **`about`** | Тухай |
| **`contact`** | Холбоо барих |
| **`help`** | Тусламж |

---

## D. ДЭЛГҮҮР ЭЗЭН — `(owner)` group

| Дэлгэц | Үүрэг |
|--------|-------|
| **`dashboard`** | Дэлгүүрийн самбар |
| **`analytics`** | Аналитик |
| **`orders`** | Захиалга |
| **`products`** | Бараа |
| **`pos`** | **POS терминал** (landscape, cash/QPay/card) |
| **`pos-history`** | POS-ийн борлуулалтын түүх |
| **`create-coupon`** | Купон үүсгэх |
| **`profile`** | Профайл |
| **`settings`** | Тохиргоо |

---

## E. БОРЛУУЛАГЧ (AFFILIATE) — `(seller)` group

| Дэлгэц | Үүрэг |
|--------|-------|
| **`dashboard`** | Affiliate-ийн нүүр |
| **`catalog`** | Зарж болох бараа |
| **`products`** | Миний бараа |
| **`earnings`** | Олсон комисс |
| **`commissions`** | Комиссны түүх |
| **`influencer`** | Influencer статус |
| **`leaderboard`** | Топ Affiliate-уудын жагсаалт |
| **`profile`** | Профайл |
| **`referral`** | Найзаа урих |

---

## F. ЖОЛООЧ — `(driver)` group

| Дэлгэц | Үүрэг |
|--------|-------|
| **`deliveries`** | Хүлээн авсан хүргэлт |
| **`delivery-detail`** | Хүргэлтийн дэлгэрэнгүй |
| **`earnings`** | Орлого |
| **`profile`** | Профайл |

---

## G. МАЛЧИН — `(herder)` group

| Дэлгэц | Үүрэг |
|--------|-------|
| **`dashboard`** | Малчны нүүр |
| **`listings`** | Миний зар (мал, бүтээгдэхүүн) |
| **`listing-form`** | Зар нэмэх |
| **`orders`** | Захиалга |
| **`order/[id]`** | Захиалгын дэлгэрэнгүй |
| **`earnings`** | Орлого |

---

## H. ЗОХИЦУУЛАГЧ — `(coordinator)` group

| Дэлгэц | Үүрэг |
|--------|-------|
| **`dashboard`** | Coordinator-ийн нүүр |
| **`applications`** | Малчин болох хүсэлт |
| **`application/[id]`** | Хүсэлт дэлгэрэнгүй |
| **`herders`** | Бүртгэгдсэн малчид |

---

## I. STANDALONE дэлгэцүүд (group биш)

| Дэлгэц | Үүрэг |
|--------|-------|
| **`cart`** | Сагс |
| **`checkout`** | Төлбөр (QPay, cash, card) |
| **`chat/[id]`** | Чат харилцан яриа |
| **`chat/ai-support`** | AI чат туслах |
| **`product/[id]`** | Бараа дэлгэрэнгүй |
| **`order/[id]`** | Захиалгын дэлгэрэнгүй |
| **`receipt/[id]`** | Захиалгын баримт |
| **`review/[orderId]`** | Үнэлгээ өгөх |
| **`storefront/[slug]`** | Дэлгүүрийн storefront |
| **`feed/[id]`** | Зар дэлгэрэнгүй |
| **`feed/create`** | Зар үүсгэх |
| **`track/[code]`** | Захиалга tracking |
| **`u/[username]`** | Хэрэглэгчийн profile |

---

# 📊 ХЭСЭГ 3: ҮНДСЭН ҮЙЛДЛҮҮД (Quick reference)

## Хэрэглэгч (Buyer) яаж юу хийдэг вэ?

| Үйлдэл | Mobile | Web |
|--------|--------|-----|
| Бүртгүүлэх | `(auth)/register` | `/register` |
| Бараа хайх | Search tab | `/search` |
| Сагсанд нэмэх | Product detail screen | `/product/[id]` |
| Захиалга өгөх | `cart` → `checkout` | `/cart` → `/checkout` |
| Захиалга харах | Orders tab | `/orders` |
| Үнэлгээ бичих | `review/[orderId]` | `/review/[orderId]` |
| Чат хийх | `chat/[id]` | `/chat/[shopSlug]` |
| Live үзэх | `(customer)/live` | `/live` |

## Дэлгүүр эзэн яаж юу хийдэг вэ?

| Үйлдэл | Mobile | Web |
|--------|--------|-----|
| Бараа нэмэх | `(owner)/products` | `/dashboard/store/products` |
| Захиалга харах | `(owner)/orders` | `/dashboard/store/orders` |
| POS ашиглах | `(owner)/pos` | — (mobile only landscape) |
| Аналитик | `(owner)/analytics` | `/dashboard/store/analytics` |
| Купон үүсгэх | `(owner)/create-coupon` | `/dashboard/store/promo-codes` |
| Storefront тохируулах | — | `/dashboard/store/storefront-editor` |
| AI tools | — | `/dashboard/store/ai-description` г.м. |

## Жолооч яаж юу хийдэг вэ?

| Үйлдэл | Mobile | Web |
|--------|--------|-----|
| Захиалга авах | `(driver)/deliveries` | `/dashboard/delivery/active` |
| Хүргэх | Tap → "Deliver" | "Mark delivered" |
| Орлого харах | `(driver)/earnings` | `/dashboard/delivery/earnings` |

## Affiliate яаж юу хийдэг вэ?

| Үйлдэл | Mobile | Web |
|--------|--------|-----|
| Бараа сонгох | `(seller)/catalog` | `/dashboard/seller/products` |
| Линк share хийх | Catalog screen | `/dashboard/affiliate/marketing` |
| Комисс харах | `(seller)/earnings` | `/dashboard/seller/earnings` |
| Influencer-д хүсэлт | `(seller)/influencer` | `/dashboard/affiliate/influencer-apply` |

---

# 🎯 ДҮГНЭЛТ

| Хэсэг | Хуудас |
|-------|--------|
| **Web public** | 12 |
| **Web auth** | 4 |
| **Web customer** | 15 |
| **Web buyer dashboard** | 7 |
| **Web store dashboard** | 60+ |
| **Web seller dashboard** | 10 |
| **Web driver dashboard** | 4 |
| **Web admin** | 40+ |
| **Web ниит** | **~150 хуудас** |
| **Mobile auth** | 4 |
| **Mobile tabs** | 10 (динамик) |
| **Mobile customer** | 35+ |
| **Mobile owner** | 9 |
| **Mobile seller** | 9 |
| **Mobile driver** | 4 |
| **Mobile herder** | 6 |
| **Mobile coordinator** | 4 |
| **Mobile standalone** | 13 |
| **Mobile нийт** | **~95 дэлгэц** |
| **БҮХ НИЙТ** | **~245 хуудас/дэлгэц** |

---

*Last updated: 2026-04-21*
*eseller.mn — Монголын хамгийн том multi-vertical e-commerce платформ*
