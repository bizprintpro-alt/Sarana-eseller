const router = require('express').Router();
const User = require('../models/User');
const AffiliateClick = require('../models/AffiliateClick');
const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const { protect, authorize } = require('../middleware/auth');

// ═══════════════════════════════════════════════════════
// POST /affiliate/click — ❌→✅ Шинэ endpoint
// Affiliate линк дээр дарах үед бүртгэх
// Frontend: Ref.capture() → _trackClick()
// ═══════════════════════════════════════════════════════
router.post('/click', async (req, res) => {
  try {
    const { referralCode, page, timestamp } = req.body;
    if (!referralCode) return res.status(400).json({ message: 'referralCode шаардлагатай' });

    // Resolve affiliate user
    const affiliate = await User.findOne({ username: referralCode, role: 'affiliate' });

    await AffiliateClick.create({
      referralCode,
      affiliate: affiliate?._id,
      page: page || req.headers.referer,
      ip: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
    });

    res.json({ ok: true });
  } catch (err) {
    // Tracking алдааг client-д хариулахгүй
    res.json({ ok: true });
  }
});

// GET /affiliate/links — Миний линкүүд + статистик
router.get('/links', protect, authorize('affiliate', 'admin'), async (req, res) => {
  try {
    const username = req.user.username;

    // Aggregate clicks by referralCode
    const clicks = await AffiliateClick.aggregate([
      { $match: { referralCode: username } },
      { $group: { _id: null, totalClicks: { $sum: 1 }, converted: { $sum: { $cond: ['$converted', 1, 0] } } } },
    ]);

    // Orders with this referral
    const orders = await Order.find({ referralCode: username, 'payment.status': 'paid' })
      .populate('items.product', 'name emoji');

    // Group by product
    const productMap = {};
    orders.forEach(o => {
      o.items.forEach(item => {
        const pid = String(item.product?._id || item._id);
        if (!productMap[pid]) {
          productMap[pid] = {
            _id: pid, productId: pid,
            productName: item.product?.name || item.name || '—',
            emoji: item.product?.emoji || item.emoji || '📦',
            clicks: 0, sales: 0, earned: 0,
          };
        }
        productMap[pid].sales += item.quantity || 1;
        productMap[pid].earned += (item.price || 0) * (item.quantity || 1) * 0.15; // approximate
      });
    });

    // Add click counts from AffiliateClick collection
    const productClicks = await AffiliateClick.aggregate([
      { $match: { referralCode: username } },
      { $group: { _id: '$page', count: { $sum: 1 } } },
    ]);

    const links = Object.values(productMap);

    // Update click counts (distribute total clicks proportionally for now)
    const totalClickCount = clicks[0]?.totalClicks || 0;
    if (links.length && totalClickCount) {
      const perLink = Math.floor(totalClickCount / links.length);
      links.forEach(l => l.clicks = perLink);
    }

    res.json({ links, totalClicks: totalClickCount, totalSales: orders.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /affiliate/link — Шинэ affiliate линк бүртгэх
router.post('/link', protect, authorize('affiliate', 'admin'), async (req, res) => {
  try {
    res.json({
      link: `${process.env.FRONTEND_URL || ''}/pages/product-detail.html?id=${req.body.productId}&ref=${req.user.username}`,
      referralCode: req.user.username,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /affiliate/earnings
router.get('/earnings', protect, authorize('affiliate', 'admin'), async (req, res) => {
  try {
    const wallet = await Wallet.getOrCreate(req.user._id);
    res.json({
      total: wallet.balance + wallet.pending + wallet.withdrawn,
      balance: wallet.balance,
      pending: wallet.pending,
      withdrawn: wallet.withdrawn,
      transactions: wallet.transactions.slice(-20).reverse(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════
// GET /affiliate/profile/:username — ❌→✅ Шинэ endpoint
// Creator public page data
// ═══════════════════════════════════════════════════════
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
      role: 'affiliate',
      isActive: true,
    });
    if (!user) return res.status(404).json({ message: 'Creator олдсонгүй' });

    // Count stats
    const [clickStats] = await AffiliateClick.aggregate([
      { $match: { referralCode: user.username } },
      { $group: { _id: null, clicks: { $sum: 1 } } },
    ]);
    const salesCount = await Order.countDocuments({ referralCode: user.username });
    const wallet = await Wallet.getOrCreate(user._id);

    res.json({
      name:      user.name,
      username:  user.username,
      bio:       user.affiliate?.bio || '',
      avatar:    user.affiliate?.avatar || user.avatar,
      cover:     user.affiliate?.cover,
      verified:  user.affiliate?.verified || false,
      social:    user.affiliate?.social || {},
      followers: user.affiliate?.followers || 0,
      sales:     salesCount,
      products:  0, // TODO: count affiliate's promoted products
      earnings:  wallet.balance + wallet.pending + wallet.withdrawn,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════
// PUT /affiliate/profile — ❌→✅ Шинэ endpoint
// Creator profile edit
// ═══════════════════════════════════════════════════════
router.put('/profile', protect, authorize('affiliate', 'admin'), async (req, res) => {
  try {
    const { name, username, bio, avatar, cover, social } = req.body;

    // Username uniqueness check
    if (username && username !== req.user.username) {
      const exists = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (exists) return res.status(400).json({ message: 'Энэ username ашиглагдаж байна' });
      req.user.username = username;
    }

    if (name) req.user.name = name;
    if (bio !== undefined)    req.user.affiliate = { ...req.user.affiliate, bio };
    if (avatar !== undefined) req.user.affiliate = { ...req.user.affiliate, avatar };
    if (cover !== undefined)  req.user.affiliate = { ...req.user.affiliate, cover };
    if (social)               req.user.affiliate = { ...req.user.affiliate, social };

    await req.user.save();
    res.json({ message: 'Профайл шинэчлэгдлээ', user: req.user.toPublic() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
