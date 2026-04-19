const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { calculateCommissions, confirmEarnings } = require('../utils/commissionCalc');
const { sendToUser } = require('../utils/sse');

// ── Order state machine ────────────────────────────────────
// Single source of truth for valid transitions. The legacy `shipped`
// state is intentionally unreachable here — new writes go through the
// expanded pipeline instead.
//
// Terminal states (`delivered`, `cancelled`) have no onward transitions.
// `cancelled` is reachable from any non-terminal state.
const STATUS_TRANSITIONS = {
  pending:          ['confirmed', 'cancelled'],
  confirmed:        ['preparing', 'cancelled'],
  preparing:        ['ready', 'cancelled'],
  ready:            ['handed_to_driver', 'cancelled'],
  handed_to_driver: ['delivering', 'cancelled'],
  delivering:       ['delivered', 'cancelled'],
  delivered:        [],
  cancelled:        [],
  // Legacy rows — admins may still move them forward.
  shipped:          ['delivering', 'delivered', 'cancelled'],
};

// Role → statuses that role is allowed to transition TO.
// Admins skip this check entirely.
const ROLE_CAN_SET = {
  seller:   new Set(['confirmed', 'preparing', 'ready', 'handed_to_driver', 'cancelled']),
  delivery: new Set(['delivering', 'delivered']),
  buyer:    new Set(['cancelled']),
};

// GET /orders
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'buyer')    filter.user = req.user._id;
    if (req.user.role === 'seller')   filter['items.product'] = { $in: await Product.find({ seller: req.user._id }).distinct('_id') };
    if (req.user.role === 'delivery') filter['delivery.driver'] = req.user._id;
    // admin sees all

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit) || 100)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price salePrice emoji category commission store seller');
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /orders
router.post('/', protect, async (req, res) => {
  try {
    const { items, payment, delivery, referral, referralCode } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'Сагс хоосон' });

    // Build order items with prices
    const orderItems = [];
    let total = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) continue;
      const price = product.salePrice || product.price;
      const qty = item.quantity || 1;
      orderItems.push({
        product: product._id, name: product.name,
        price, quantity: qty, emoji: product.emoji,
      });
      total += price * qty;
    }

    const deliveryFee = total >= 50000 ? 0 : 3000;

    // Resolve affiliate from referralCode
    const refCode = referralCode || referral;
    let affiliateId;
    if (refCode) {
      const aff = await User.findOne({
        $or: [{ username: refCode }, { _id: refCode.match(/^[0-9a-fA-F]{24}$/) ? refCode : null }],
        role: 'affiliate',
      });
      if (aff) affiliateId = aff._id;
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      total: total + deliveryFee,
      deliveryFee,
      payment: { method: payment?.method || 'qpay' },
      delivery: delivery || {},
      referralCode: refCode || undefined,
      affiliate: affiliateId,
    });

    // Populate for response
    await order.populate('items.product', 'name price salePrice emoji category commission store seller');

    // Notify seller(s)
    const sellerIds = [...new Set(orderItems.map(i => String(i.product?.seller || '')).filter(Boolean))];
    sellerIds.forEach(sid => {
      sendToUser(sid, 'new-order', {
        orderId: order._id, orderNumber: order.orderNumber, total: order.total,
      });
    });

    res.status(201).json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /orders/:id/status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const next = req.body.status;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';

    // ── Enum check — stops silent DB corruption ──
    if (!next || !Object.prototype.hasOwnProperty.call(STATUS_TRANSITIONS, next)) {
      return res.status(400).json({ message: `Зөвшөөрөгдөөгүй төлөв: ${next}` });
    }

    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name price salePrice emoji category commission store seller');
    if (!order) return res.status(404).json({ message: 'Захиалга олдсонгүй' });

    const prev = order.status;

    // ── Transition check (admin bypasses) ──
    if (!isAdmin) {
      const allowed = STATUS_TRANSITIONS[prev] || [];
      if (prev !== next && !allowed.includes(next)) {
        return res.status(400).json({
          message: `"${prev}" төлвөөс "${next}" рүү шилжих боломжгүй`,
        });
      }

      // ── Role check (admin bypasses) ──
      const roleCan = ROLE_CAN_SET[req.user.role];
      if (!roleCan || !roleCan.has(next)) {
        return res.status(403).json({
          message: 'Энэ төлөвт шилжүүлэх эрх хүрэхгүй',
        });
      }

      // Buyers can only cancel their own orders, and only before they ship.
      if (req.user.role === 'buyer') {
        if (String(order.user) !== String(req.user._id)) {
          return res.status(403).json({ message: 'Энэ захиалга таных биш' });
        }
        if (!['pending', 'confirmed'].includes(prev)) {
          return res.status(400).json({
            message: 'Бэлтгэл эхэлсэн захиалгыг цуцалж болохгүй',
          });
        }
      }
    }

    order.status = next;

    // Commission calc on first confirmation.
    if (next === 'confirmed' && !order.commissions?.calculated) {
      await calculateCommissions(order);
    }

    // Driver pickup timestamp + driver binding (legacy `shipped` path kept
    // for back-compat if an old client still POSTs it).
    if ((next === 'handed_to_driver' || next === 'shipped') && !order.delivery?.pickedAt) {
      order.delivery.pickedAt = new Date();
      if (req.user.role === 'delivery') order.delivery.driver = req.user._id;
    }

    // Delivered → release escrow / confirm affiliate earnings.
    if (next === 'delivered' && prev !== 'delivered') {
      order.delivery.deliveredAt = new Date();
      await confirmEarnings(order);
    }

    await order.save();

    sendToUser(order.user, 'order-status', {
      orderId: order._id, orderNumber: order.orderNumber, status: order.status,
    });

    res.json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
