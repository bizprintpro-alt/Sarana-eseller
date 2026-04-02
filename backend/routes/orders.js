const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { calculateCommissions, confirmEarnings } = require('../utils/commissionCalc');
const { sendToUser } = require('../utils/sse');

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
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
  }
});

// PUT /orders/:id/status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name price salePrice emoji category commission store seller');
    if (!order) return res.status(404).json({ message: 'Захиалга олдсонгүй' });

    const prev = order.status;
    order.status = req.body.status;

    // Төлбөр баталгаажсан → комисс тооцоолох
    if (req.body.status === 'confirmed' && !order.commissions?.calculated) {
      await calculateCommissions(order);
    }

    // Хүргэлт хийгдсэн → pending earnings → balance
    if (req.body.status === 'delivered' && prev !== 'delivered') {
      order.delivery.deliveredAt = new Date();
      await confirmEarnings(order);
    }

    if (req.body.status === 'shipped' && !order.delivery?.pickedAt) {
      order.delivery.pickedAt = new Date();
      if (req.user.role === 'delivery') order.delivery.driver = req.user._id;
    }

    await order.save();

    // Notify buyer
    sendToUser(order.user, 'order-status', {
      orderId: order._id, orderNumber: order.orderNumber, status: order.status,
    });

    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
