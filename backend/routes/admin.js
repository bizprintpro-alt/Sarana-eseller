const router = require('express').Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Commission = require('../models/Commission');
const Wallet = require('../models/Wallet');
const AffiliateClick = require('../models/AffiliateClick');
const { protect, authorize } = require('../middleware/auth');

const adminOnly = [protect, authorize('admin')];

// Escape user-provided text before building a Mongo $regex — prevents ReDoS and
// syntactic injection (e.g. `(.*)+`, unbounded quantifiers).
function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /admin/stats
router.get('/stats', adminOnly, async (req, res) => {
  try {
    const [users, shops, affiliates, drivers, orders, products] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'seller', isActive: true }),
      User.countDocuments({ role: 'affiliate', isActive: true }),
      User.countDocuments({ role: 'delivery', isActive: true }),
      Order.find({ 'payment.status': 'paid' }),
      Product.countDocuments({ isActive: true }),
    ]);

    const gmv = orders.reduce((s, o) => s + (o.total || 0), 0);
    const revenue = orders.reduce((s, o) => s + (o.commissions?.platform || 0), 0);
    const pendingPay = await Wallet.aggregate([{ $group: { _id: null, total: { $sum: '$pending' } } }]);

    res.json({
      users, shops, affiliates, drivers, products,
      orders: orders.length,
      gmv,
      revenue,
      pendingPay: pendingPay[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /admin/users
router.get('/users', adminOnly, async (req, res) => {
  try {
    const { role, limit = 100, page = 1, search } = req.query;
    const filter = {};
    if (role && role !== 'all') filter.role = role;
    if (search) {
      const q = escapeRegex(String(search).slice(0, 80));
      filter.$or = [
        { name:  { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select('-password');
    const total = await User.countDocuments(filter);
    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /admin/commission
router.get('/commission', adminOnly, async (req, res) => {
  try {
    const rates = await Commission.getGlobal();
    res.json(rates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /admin/commission
router.put('/commission', adminOnly, async (req, res) => {
  try {
    const { seller, affiliate, platform, delivery } = req.body;
    const total = (seller || 0) + (affiliate || 0) + (platform || 0) + (delivery || 0);
    if (total !== 100) return res.status(400).json({ message: 'Нийт 100% байх ёстой' });

    const rates = await Commission.findOneAndUpdate(
      { type: 'global' },
      { seller, affiliate, platform, delivery, updatedBy: req.user._id },
      { new: true, upsert: true }
    );
    res.json(rates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════
// GET /admin/commission/categories — ❌→✅ Шинэ endpoint
// ═══════════════════════════════════════════════════════
router.get('/commission/categories', adminOnly, async (req, res) => {
  try {
    const categories = await Commission.find({ type: 'category' });

    // Default categories if none exist
    const defaults = ['fashion', 'electronics', 'food', 'beauty', 'digital', 'services', 'home', 'sports'];
    const existing = new Set(categories.map(c => c.category));
    const global = await Commission.getGlobal();

    const result = {};
    for (const cat of defaults) {
      if (existing.has(cat)) {
        const c = categories.find(x => x.category === cat);
        result[cat] = { seller: c.seller, affiliate: c.affiliate, platform: c.platform, delivery: c.delivery };
      } else {
        result[cat] = { seller: global.seller, affiliate: global.affiliate, platform: global.platform, delivery: global.delivery };
      }
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════
// PUT /admin/commission/categories — ❌→✅ Шинэ endpoint
// ═══════════════════════════════════════════════════════
router.put('/commission/categories', adminOnly, async (req, res) => {
  try {
    const categories = req.body; // { fashion: {seller,affiliate,platform,delivery}, ... }
    const ops = [];
    for (const [cat, rates] of Object.entries(categories)) {
      const total = (rates.seller || 0) + (rates.affiliate || 0) + (rates.platform || 0) + (rates.delivery || 0);
      if (total !== 100) {
        return res.status(400).json({ message: `${cat} ангиллын нийт ${total}% — 100% байх ёстой` });
      }
      ops.push(Commission.findOneAndUpdate(
        { type: 'category', category: cat },
        { ...rates, type: 'category', category: cat, updatedBy: req.user._id },
        { upsert: true, new: true }
      ));
    }
    await Promise.all(ops);
    res.json({ message: 'Ангиллын комисс хадгалагдлаа', categories: Object.keys(categories).length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
