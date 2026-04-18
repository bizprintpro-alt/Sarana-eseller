// ════════════════════════════════════════════════════════
// Малчнаас шууд (direct-from-herder) marketplace
//
// Public:
//   GET  /herder/products           list (filter: province, category, herderId, limit, page)
//   GET  /herder/products/:id       product detail
//   GET  /herder/profile/:id        public herder profile + stats
//
// Auth (JWT):
//   POST /herder/register           нэвтэрсэн buyer → herder application
//
// Auth + requireHerder (seller-side CRUD, M5/M6):
//   GET    /herder/my/products                   өөрийн listings (pagination)
//   POST   /herder/my/products                   шинэ бараа
//   PUT    /herder/my/products/:id               засвар
//   DELETE /herder/my/products/:id               soft-delete
//   GET    /herder/my/orders                     өөрийн orders
//   PUT    /herder/my/orders/:id/status          state transition
//   GET    /herder/my/earnings                   summary
//
// Future PR: /herder/coordinator/*
// ════════════════════════════════════════════════════════

const router = require('express').Router();
const HerderProfile = require('../models/HerderProfile');
const HerderProduct = require('../models/HerderProduct');
const HerderOrder   = require('../models/HerderOrder');
const { protect } = require('../middleware/auth');
const { requireHerder } = require('../middleware/herder');
const { PROVINCE_CODES, HERDER_CATEGORIES } = require('../models/HerderProfile');

// Province code → localized name (server-side source of truth)
const PROVINCE_NAMES = {
  AKH: 'Архангай',   BOL: 'Баян-Өлгий', BKH: 'Баянхонгор',
  BUL: 'Булган',     GOA: 'Говь-Алтай', GOS: 'Говьсүмбэр',
  DAR: 'Дархан-Уул', DOR: 'Дорнод',     DOG: 'Дорноговь',
  DUN: 'Дундговь',   ZAV: 'Завхан',     OVR: 'Өвөрхангай',
  OMN: 'Өмнөговь',   SUK: 'Сүхбаатар',  SEL: 'Сэлэнгэ',
  TOV: 'Төв',        UVS: 'Увс',        KHO: 'Ховд',
  KHV: 'Хөвсгөл',    KHE: 'Хэнтий',     ORK: 'Орхон',
};

// ── helpers ──────────────────────────────────────────────
function productToPublic(p, herderSummary) {
  return {
    id:                p._id,
    name:              p.name,
    price:             p.price,
    salePrice:         p.salePrice ?? null,
    images:            p.images || [],
    category:          p.category,
    description:       p.description || '',
    stock:             p.stock,
    requiresColdChain: p.requiresColdChain,
    herder:            herderSummary || null,
  };
}

function herderSummary(h) {
  if (!h) return null;
  return {
    id:           h._id,
    herderName:   `${h.firstName} ${h.lastName}`,
    province:     h.province,
    provinceName: h.provinceName,
    district:     h.district,
    isVerified:   h.isVerified,
    rating:       h.rating,
    orderCount:   h.orderCount,
  };
}

// ── PUBLIC: GET /herder/products ─────────────────────────
router.get('/products', async (req, res) => {
  try {
    const { province, category, herderId, limit = 20, page = 1 } = req.query;
    const filter = { isActive: true };

    if (province)  filter.province = String(province).toUpperCase();
    if (category)  filter.category = category;
    if (herderId)  filter.herder   = herderId;

    const lim = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 60);
    const pg  = Math.max(parseInt(page,  10) || 1, 1);

    const [products, total] = await Promise.all([
      HerderProduct.find(filter)
        .sort({ createdAt: -1 })
        .limit(lim)
        .skip((pg - 1) * lim)
        .populate({
          path:  'herder',
          match: { status: 'approved' }, // тохирохгүй malchny product-уудыг хасах
          select: 'firstName lastName province provinceName district isVerified rating orderCount',
        })
        .lean(),
      HerderProduct.countDocuments(filter),
    ]);

    // populate-match null бол уг product-ийг буцаахгүй
    const visible = products
      .filter((p) => p.herder)
      .map((p) => productToPublic(p, herderSummary(p.herder)));

    res.json({
      products: visible,
      total,
      page:  pg,
      pages: Math.ceil(total / lim),
    });
  } catch (err) {
    console.error('[herder/products]', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// ── PUBLIC: GET /herder/products/:id ─────────────────────
router.get('/products/:id', async (req, res) => {
  try {
    const p = await HerderProduct.findById(req.params.id)
      .populate({
        path:   'herder',
        match:  { status: 'approved' },
        select: 'firstName lastName province provinceName district isVerified rating orderCount',
      })
      .lean();

    if (!p || !p.isActive) return res.status(404).json({ message: 'Бараа олдсонгүй' });
    if (!p.herder)         return res.status(404).json({ message: 'Малчин идэвхгүй' });

    res.json(productToPublic(p, herderSummary(p.herder)));
  } catch (err) {
    console.error('[herder/products/:id]', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// ── PUBLIC: GET /herder/profile/:id ──────────────────────
router.get('/profile/:id', async (req, res) => {
  try {
    const h = await HerderProfile.findOne({
      _id:    req.params.id,
      status: 'approved',
    });
    if (!h) return res.status(404).json({ message: 'Малчин олдсонгүй' });
    res.json(h.toPublic());
  } catch (err) {
    console.error('[herder/profile/:id]', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// ── AUTH: POST /herder/register ──────────────────────────
// Buyer нэвтэрсний дараа малчин болох application илгээнэ.
// Ажил: HerderProfile үүсгэж status='pending' болгох. Admin-ийн shigeede
// status='approved' болгоход user.role → 'herder' болно (future PR).
router.post('/register', protect, async (req, res) => {
  try {
    const {
      firstName, lastName, registerNumber, phone,
      province, district,
      livestock, aDansNumber, vetCertUri,
      bankName, bankAccount,
      gps, notes,
    } = req.body;

    // ── Validation ──────────────────────────────────────
    if (!firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Овог нэрээ оруулна уу' });
    }
    if (!registerNumber || !/^[А-ЯЁӨҮа-яёөү]{2}\d{8}$/.test(registerNumber)) {
      return res.status(400).json({ success: false, message: 'Регистрийн дугаар буруу' });
    }
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Утасны дугаар оруулна уу' });
    }
    if (!province || !PROVINCE_CODES.includes(String(province).toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Аймгийн код буруу' });
    }
    if (!district) {
      return res.status(400).json({ success: false, message: 'Сум/баг оруулна уу' });
    }
    if (!bankName || !bankAccount) {
      return res.status(400).json({ success: false, message: 'Банкны мэдээлэл дутуу' });
    }

    // Нэг user нэг л profile-тэй
    const existing = await HerderProfile.findOne({ user: req.user._id });
    if (existing) {
      return res.status(409).json({
        success:       false,
        message:       'Таны өргөдөл аль хэдийн илгээгдсэн',
        applicationId: existing._id,
      });
    }

    // Регистр давхцахгүй байх
    const dup = await HerderProfile.findOne({ registerNumber });
    if (dup) {
      return res.status(409).json({
        success: false,
        message: 'Энэ регистрийн дугаар бүртгэлтэй байна',
      });
    }

    const code = String(province).toUpperCase();
    const profile = await HerderProfile.create({
      user: req.user._id,
      firstName, lastName, registerNumber, phone,
      province:     code,
      provinceName: PROVINCE_NAMES[code],
      district,
      aDansNumber:  aDansNumber || undefined,
      vetCertUri:   vetCertUri  || undefined,
      livestock:    livestock   || {},
      bankInfo: {
        bankName,
        accountNumber: bankAccount,
        accountName:   `${lastName} ${firstName}`,
      },
      gps:    gps   || undefined,
      notes:  notes || undefined,
      status: 'pending',
    });

    res.status(201).json({
      success:       true,
      applicationId: profile._id,
      message:       'Өргөдөл илгээгдлээ. 24-48 цагийн дотор хянагдана.',
    });
  } catch (err) {
    console.error('[herder/register]', err);
    // Mongoose duplicate-key error
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Давхардсан мэдээлэл байна' });
    }
    res.status(500).json({ success: false, message: 'Серверийн алдаа' });
  }
});

// ══════════════════════════════════════════════════════════
// SELLER SIDE — өөрийн barааны CRUD + захиалгууд + орлого
// Бүгд `protect + requireHerder` хэрэглэнэ.
// ══════════════════════════════════════════════════════════

const PRODUCT_WRITABLE = [
  'name', 'description', 'price', 'salePrice',
  'category', 'images', 'stock', 'requiresColdChain',
];
function pickProduct(body) {
  const out = {};
  for (const k of PRODUCT_WRITABLE) if (body[k] !== undefined) out[k] = body[k];
  return out;
}

// ── GET /herder/my/products ──────────────────────────────
router.get('/my/products', protect, requireHerder, async (req, res) => {
  try {
    const { limit = 20, page = 1, includeInactive } = req.query;
    const lim = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 60);
    const pg  = Math.max(parseInt(page,  10) || 1, 1);

    const filter = { herder: req.herderProfile._id };
    if (!includeInactive) filter.isActive = true;

    const [products, total] = await Promise.all([
      HerderProduct.find(filter)
        .sort({ createdAt: -1 })
        .limit(lim)
        .skip((pg - 1) * lim)
        .lean(),
      HerderProduct.countDocuments(filter),
    ]);

    res.json({ products, total, page: pg, pages: Math.ceil(total / lim) });
  } catch (err) {
    console.error('[herder/my/products]', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// ── POST /herder/my/products ─────────────────────────────
router.post('/my/products', protect, requireHerder, async (req, res) => {
  try {
    const data = pickProduct(req.body);

    if (!data.name || !data.name.trim()) {
      return res.status(400).json({ message: 'Барааны нэр оруулна уу' });
    }
    if (!Number.isFinite(data.price) || data.price < 0) {
      return res.status(400).json({ message: 'Үнэ буруу' });
    }
    if (!data.category || !HERDER_CATEGORIES.includes(data.category)) {
      return res.status(400).json({ message: 'Категор буруу' });
    }
    if (data.salePrice != null && data.salePrice >= data.price) {
      return res.status(400).json({ message: 'Хямдралтай үнэ нь үндсэн үнээс бага байх ёстой' });
    }

    const product = await HerderProduct.create({
      ...data,
      herder:   req.herderProfile._id,
      province: req.herderProfile.province,
    });

    // productCount статикийг бодитоор дахин тооц
    await HerderProfile.updateOne(
      { _id: req.herderProfile._id },
      { $inc: { 'stats.productCount': 1 } },
    );

    res.status(201).json(product);
  } catch (err) {
    console.error('[herder/my/products POST]', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// ── PUT /herder/my/products/:id ──────────────────────────
router.put('/my/products/:id', protect, requireHerder, async (req, res) => {
  try {
    const product = await HerderProduct.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Бараа олдсонгүй' });

    if (String(product.herder) !== String(req.herderProfile._id)) {
      return res.status(403).json({ message: 'Зөвхөн өөрийн бараагаа засах эрхтэй' });
    }

    const data = pickProduct(req.body);
    if (data.category && !HERDER_CATEGORIES.includes(data.category)) {
      return res.status(400).json({ message: 'Категор буруу' });
    }
    if (data.price != null && (!Number.isFinite(data.price) || data.price < 0)) {
      return res.status(400).json({ message: 'Үнэ буруу' });
    }
    const newPrice    = data.price     ?? product.price;
    const newSalePrice = data.salePrice !== undefined ? data.salePrice : product.salePrice;
    if (newSalePrice != null && newSalePrice >= newPrice) {
      return res.status(400).json({ message: 'Хямдралтай үнэ нь үндсэн үнээс бага байх ёстой' });
    }

    Object.assign(product, data);
    await product.save();
    res.json(product);
  } catch (err) {
    console.error('[herder/my/products PUT]', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// ── DELETE /herder/my/products/:id ───────────────────────
// Soft delete — статистик, order history-г алдагдуулахгүй.
router.delete('/my/products/:id', protect, requireHerder, async (req, res) => {
  try {
    const product = await HerderProduct.findById(req.params.id);
    if (!product)           return res.status(404).json({ message: 'Бараа олдсонгүй' });
    if (!product.isActive)  return res.json({ message: 'Аль хэдийн устсан' });

    if (String(product.herder) !== String(req.herderProfile._id)) {
      return res.status(403).json({ message: 'Зөвхөн өөрийн бараагаа устгах эрхтэй' });
    }

    product.isActive = false;
    await product.save();

    await HerderProfile.updateOne(
      { _id: req.herderProfile._id },
      { $inc: { 'stats.productCount': -1 } },
    );

    res.json({ message: 'Устгагдлаа' });
  } catch (err) {
    console.error('[herder/my/products DELETE]', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// ── GET /herder/my/orders ────────────────────────────────
router.get('/my/orders', protect, requireHerder, async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const lim = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 60);
    const pg  = Math.max(parseInt(page,  10) || 1, 1);

    const filter = { herder: req.herderProfile._id };
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      HerderOrder.find(filter)
        .sort({ createdAt: -1 })
        .limit(lim)
        .skip((pg - 1) * lim)
        .populate('buyer', 'name phone')
        .lean(),
      HerderOrder.countDocuments(filter),
    ]);

    res.json({ orders, total, page: pg, pages: Math.ceil(total / lim) });
  } catch (err) {
    console.error('[herder/my/orders]', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// ── PUT /herder/my/orders/:id/status ─────────────────────
// Herder-т зөвшөөрөгдсөн transitions:
//   confirmed → preparing → shipped
// (pending→confirmed автомат payment-ийн дараа, delivered→driver/buyer гаргана).
const HERDER_ALLOWED_TRANSITIONS = {
  confirmed: ['preparing'],
  preparing: ['shipped'],
};

router.put('/my/orders/:id/status', protect, requireHerder, async (req, res) => {
  try {
    const { status: nextStatus, note } = req.body;
    const order = await HerderOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Захиалга олдсонгүй' });

    if (String(order.herder) !== String(req.herderProfile._id)) {
      return res.status(403).json({ message: 'Зөвхөн өөрийн захиалгаа удирдах эрхтэй' });
    }

    const allowed = HERDER_ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowed.includes(nextStatus)) {
      return res.status(400).json({
        message: `${order.status} → ${nextStatus} шилжилт зөвшөөрөгдөхгүй`,
        allowed,
      });
    }

    order.status = nextStatus;
    order.statusHistory.push({
      status:   nextStatus,
      byUserId: req.user._id,
      byRole:   'herder',
      note,
    });
    if (nextStatus === 'shipped') order.delivery.shippedAt = new Date();

    await order.save();
    res.json(order);
  } catch (err) {
    console.error('[herder/my/orders/:id/status]', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// ── GET /herder/my/earnings ──────────────────────────────
// Буцаах: нийт орлого (released), escrow held, pending (pay-аагүй), pay-out дарсан түүх дараагийн PR-т.
router.get('/my/earnings', protect, requireHerder, async (req, res) => {
  try {
    const herderId = req.herderProfile._id;

    const [releasedAgg, heldAgg, pendingAgg, recent] = await Promise.all([
      HerderOrder.aggregate([
        { $match: { herder: herderId, 'escrow.status': 'released' } },
        { $group: { _id: null, total: { $sum: '$escrow.holdAmount' }, count: { $sum: 1 } } },
      ]),
      HerderOrder.aggregate([
        { $match: { herder: herderId, 'escrow.status': 'held' } },
        { $group: { _id: null, total: { $sum: '$escrow.holdAmount' }, count: { $sum: 1 } } },
      ]),
      HerderOrder.aggregate([
        { $match: {
            herder: herderId,
            status: { $nin: ['cancelled'] },
            'payment.status': 'pending',
        } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      HerderOrder.find({ herder: herderId, 'escrow.status': 'released' })
        .sort({ 'escrow.releasedAt': -1 })
        .limit(10)
        .select('orderNumber total escrow.holdAmount escrow.releasedAt')
        .lean(),
    ]);

    const pick = (arr) => arr[0] || { total: 0, count: 0 };

    res.json({
      released: pick(releasedAgg),   // аль хэдийн гарт очсон
      held:     pick(heldAgg),       // delivered, escrow-д хүлээж байгаа
      pending:  pick(pendingAgg),    // pay-аагүй захиалгууд
      recentPayouts: recent,
      commissionRate: 10,             // default (admin config дараа)
    });
  } catch (err) {
    console.error('[herder/my/earnings]', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

module.exports = router;
