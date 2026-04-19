# eseller.mn System Audit — 2026-04-19

**Scope:** `Sarana-eseller/backend` + `Sarana-eseller/nextjs` (web) + `eseller-mobile`
**Method:** 4 parallel code audits — API contract parity, RBAC matrix, product display parity, dropship UX + order state machine.
**Goal:** find the gaps between backend, web, and mobile that make the three feel like "different systems."

---

## TL;DR

Системийн эрүүл мэнд: **дунд зэргийн эмзэг**. Гол хоёр зангилаа эвдэрсэн байна:

1. **Regular Order state machine эвдэрсэн** — backend 5 төлөв мэднэ, UI 8 төлөв хүлээдэг. Buyer захиалгууд "Unknown status" харагдах эрсдэлтэй.
2. **Dropshipping UX-only** — mobile дээр бүх UI байгаа ч backend-д талбар, endpoint огт байхгүй. Хэрэглэгч бараа import хийхэд data алдагдана.

Гуравдагч дундаж эрсдэл: **Web + mobile нь cross-layer auth enforcement-гүй** — page guards localStorage-ыг л итгэдэг, server-side role check хаа ч байхгүй.

---

## 🔴 CRITICAL (must-fix)

### C1. Regular `Order.status` enum mismatch — "Unknown status" bug
- **Backend** `Order.js:19–23`: `pending | confirmed | shipped | delivered | cancelled` (5)
- **Web buyer** `nextjs/.../orders/page.tsx:9–18`: 8 төлөв (`pending → confirmed → preparing → ready → handed_to_driver → delivering → delivered → cancelled`)
- **Mobile buyer** `app/order/[id].tsx:8–15`: 6 төлөв (`pending, confirmed, preparing, ready, delivering, delivered`)
- **Impact:** Backend `shipped` илгээхэд UI `STATUS_STEPS`-аас олдохгүй → "Unknown status" эсвэл `currentStepIdx = -1` (timeline хоосон).
- **Fix:** `Order.js` enum-ыг UI-тай тэнцүүлэх **эсвэл** UI-г backend-тай тэнцүүлэх. Аль аль нь боломжтой — **backend-ийг өргөтгөх** нь зөв (олон төлөвтэй fulfillment pipeline нь бодит шаардлага).

### C2. Backend `PUT /orders/:id/status` enum validation байхгүй
- `backend/routes/orders.js:92–128` — ирсэн `status` string-ийг **ямар ч шалгалтгүй** DB-д бичдэг.
- **Impact:** UI буруу төлөв илгээвэл silent corruption. Mobile seller-ийн `owner/orders.tsx:17–21` `handed_to_driver` илгээдэг — backend үүнийг хүлээн авна, гэвч Order.js enum-д байхгүй тул schema-validation алдаа эсвэл silent type coerce тохиох.
- **Fix:** route дотор whitelist + state-transition check.

### C3. Dropshipping — UX бэлэн, backend байхгүй
- **Mobile** `app/(customer)/dropship.tsx` — AliExpress / CJ Drop source switcher, margin calculator, import form.
- **Mobile call:** `POST /dropship/import` (mobile dropship.tsx:59). **Backend route зүгээр л байхгүй** — 404.
- **Backend Product model:** `Product.js`-д `isDropship`, `supplierUrl`, `supplierPrice`, `supplierStock`, `originCountry`, `estimatedShippingDaysMin/Max` **огт байхгүй**.
- **Impact:** Хэрэглэгч "Импортлох" дарахад ямар ч юм болохгүй. Эсвэл 500 алдаа харуулна.
- **Fix:**
  1. Product-д dropship талбаруудыг нэмэх (7 талбар).
  2. `POST /dropship/import` route нэмэх (AliExpress URL → scraper/API → Product.create).
  3. Product detail page-д "Олон улсаас хүргэнэ", "15-30 хоног", "Хүргэлт гарын үнэд багтаагүй" гэсэн badges (Amazon standard).

### C4. OTP forgot-password flow — mobile UI байна, backend endpoint байхгүй
- Mobile calls `/auth/otp-send`, `/auth/otp/verify`, `/auth/reset-password` (forgot-password.tsx).
- Backend `routes/auth.js` нь register + login + me-г л мэднэ.
- **Impact:** "Нууц үг мартсан" гэснээр 404 / timeout.
- **Fix:** нэг бол OTP provider integration хийх (SMS.mn, Twilio), нэг бол UI-г "удахгүй" заалт оруулж нуух.

### C5. Mobile herder/coordinator routes зочлоход guard байхгүй
- `app/(herder)/_layout.tsx`, `app/(coordinator)/_layout.tsx` — auth check байхгүй.
- `src/shared/routing.ts:17–34` `routeByRole`-д herder, coordinator case байхгүй — нэвтрэхэд зүгээр `/(tabs)` рүү явуулна.
- **Impact:** (a) Зөвхөн buyer role-той deep-link хаяг бичвэл herder dashboard нээгдэнэ. (b) Жинхэнэ herder/coordinator нэвтэрсний дараа өөрийн UI-д хүрэхгүй.
- **Fix:** хоёр `_layout.tsx`-д `useAuth()` + role guard + redirect. `mapRole()` + `routeByRole()`-д herder/coordinator кейсүүд нэмэх.

### C6. Web dashboard — zero role enforcement
- `nextjs/app/dashboard/layout.tsx:348` — зөвхөн `localStorage.getItem('token')` байгаа эсэхийг шалгадаг.
- **Impact:** Нэвтэрсэн ямар ч хэрэглэгч `/dashboard/admin/*` нээж чадна (UI backend API дуудахад л blocks). Role fake хийж title, stats харж болох шинж.
- **Fix:** Next.js middleware эсвэл server component-д JWT verify + role enforce.

### C7. Regular product detail — mobile-д reviews огт байхгүй
- Web `ProductDetailClient.tsx:75–200` — бүрэн ReviewSection (Zvertype.tsx дуудна).
- Mobile `app/product/[id].tsx:20–373` — `rating` badge байна, review list байхгүй.
- **Impact:** Buyer үнэлгээ уншихгүйгээр шийднэ — trust loss.
- **Fix:** mobile-д ReviewSection component хийж `GET /products/:id/reviews` дуудна.

---

## 🟡 MEDIUM (plan for next iteration)

### M1. Mobile product detail талбар дутуу
| Талбар | Backend | Web | Mobile | Severity |
|--|--|--|--|--|
| salePrice strikethrough | ✅ | ✅ | ❌ | 🟡 |
| deliveryFee | ✅ | ✅ | ❌ | 🟡 |
| estimatedMins | ✅ | ✅ | ❌ | 🟡 |
| Related products | ✅ | ✅ | ❌ | 🟡 |
| Chat with seller button | ✅ | ✅ | ❌ | 🟡 |

### M2. Mobile entity-type coverage — 2 vs 7
Web `ProductDetailClient` нь 7 entity (STORE, REAL_ESTATE, AUTO, SERVICE, CONSTRUCTION, PRE_ORDER, DIGITAL) тус бүрд тусгай layout. Mobile зөвхөн STORE + HERDER мэднэ. Бусад нь generic fallback.
- **Fix:** дор хаяж REAL_ESTATE, SERVICE, PRE_ORDER-д mobile-д туссан layout нэмэх (1-ээр нэгээр).

### M3. `requireHerder` middleware — admin bypass эмзэг
`backend/middleware/herder.js:12` — admin-ийг hard-allow хийдэг ч `HerderProfile.status` шалгах логикоос өмнө гарч одно. Admin-д HerderProfile байхгүй бол seller endpoint-уудыг дуусгаж чадна, гэхдээ rating aggregation гэх мэт үед `req.herderProfile` undefined → crash.
- **Fix:** admin bypass-ыг эдгээр дотоод талбар хэрэглэдэг route-ууд дээр үгүй болгох эсвэл нэмэлт `profile || stubAdminProfile` хийх.

### M4. POS order endpoint param mismatch
Mobile POS `POST /orders/pos` payload `{items, paymentMethod, total, vatIncluded, cashReceived}` vs backend order controller `{items, payment, delivery, referral}`.
- **Fix:** backend-д `/orders/pos` тусад нь dedicated route эсвэл mobile payload-ыг стандарт Order shape-тай тэнцүүлэх.

### M5. Response envelope inconsistency
Зарим backend route `{success, data, error}` envelope ашигладаг, зарим нь raw. Mobile `unwrap()` defensive хийдэг — одоогоор ажиллаж байна, гэвч шинэ developer бичихэд амархан эвдрэнэ.
- **Fix:** backend `middleware/response.js`-ээр бүх route-д нэг envelope-ыг баталгаажуулах.

---

## 🟢 LOW / Systemic

- Order + HerderOrder parallel models — нэмэх feature болгонд 2 удаа хийх шаардлага.
- Mobile дээр driver role routing байхгүй (`routeByRole`-ын 'delivery' case `/(driver)/deliveries`, гэвч backend-д `requireDriver` middleware ч байхгүй).
- Web-д rate-limit, audit log байхгүй (backend ч мөн адил — `express-rate-limit` суулгасан ч auth-ын цаанаа байхгүй).
- `affiliate` role UI нь mobile-аас бага — web дээр dashboard бүрэн, mobile-д link-only.

---

## Prioritized action plan — 7 хоногоор

### Week 1 (критик засвар)
- [ ] **C1 + C2**: Order.status enum + validation сэргээх. Backend Order.js expand + routes/orders.js whitelist. Web/Mobile status set-ийг тэгшитгэх.
- [ ] **C4**: OTP flow сонголт — эсвэл implement, эсвэл mobile UI feature-flag хийж нуух.
- [ ] **C5**: mobile herder/coordinator guards + routeByRole coverage.

### Week 2 (UX parity)
- [ ] **C3**: Dropshipping backend fields + `POST /dropship/import` route. Product card/detail-д dropship badges.
- [ ] **C6**: Web dashboard-д server-side role middleware.
- [ ] **C7**: mobile regular product-д ReviewSection.
- [ ] **M1**: mobile product detail-д salePrice strikethrough, deliveryFee, estimatedMins, related products.

### Week 3+ (systemic)
- [ ] **M2**: mobile entity-type layouts (REAL_ESTATE, SERVICE, PRE_ORDER).
- [ ] **M3 + M4 + M5**: middleware cleanup.

---

## Bottom line

Сүүлийн 3 milestone (M12–M14, reviews)-д **архитектурын засвар ороогүй** — тэдгээр нь шинэ feature layer. Энэхүү audit-аас харахад **системийн суурь засвар** (order state, auth gating, dropship backend) нь product-ын нэмэлт feature-ээс илүү чухал. Эхний ээлжид C1, C2, C4, C5-ыг барих нь "нэг системийн хэмжээнд харагдах" мэдрэмжийг маш хурдан сэргээнэ.
