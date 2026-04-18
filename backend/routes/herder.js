// ════════════════════════════════════════════════════════
// Малчнаас шууд (direct-from-herder) marketplace
// Энэ файл M0-M4 mobile screens-ийн backend contract.
//
// Public endpoints:
//   GET  /herder/products           list (filter: province, category, herderId, limit, page)
//   GET  /herder/products/:id       product detail
//   GET  /herder/profile/:id        public herder profile + stats
//
// Auth'd:
//   POST /herder/register           нэвтэрсэн buyer → herder application
//
// Future PR-ууд: /herder/my/*, /herder/coordinator/*
// ════════════════════════════════════════════════════════

const router = require('express').Router();
const HerderProfile = require('../models/HerderProfile');
const HerderProduct = require('../models/HerderProduct');
const { protect } = require('../middleware/auth');
const { PROVINCE_CODES } = require('../models/HerderProfile');

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

module.exports = router;
