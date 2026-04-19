const router = require('express').Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const { calculateCommissions } = require('../utils/commissionCalc');
const { sendToUser } = require('../utils/sse');

// QPay token cache
let qpayToken = null;
let qpayTokenExpiry = 0;

async function getQPayToken() {
  if (qpayToken && Date.now() < qpayTokenExpiry) return qpayToken;
  const res = await fetch('https://merchant.qpay.mn/v2/auth/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(
        `${process.env.QPAY_USERNAME}:${process.env.QPAY_PASSWORD}`
      ).toString('base64'),
    },
  });
  const data = await res.json();
  qpayToken = data.access_token;
  qpayTokenExpiry = Date.now() + (data.expires_in || 3600) * 1000 - 60000;
  return qpayToken;
}

// POST /payment/qpay/create
router.post('/qpay/create', protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: 'orderId шаардлагатай' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Захиалга олдсонгүй' });
    if (String(order.user) !== String(req.user._id || req.user.id)) {
      return res.status(403).json({ message: 'Зөвхөн эзэмшигч төлбөр үүсгэх боломжтой' });
    }

    // Always derive amount server-side from the order — never trust client
    const invoiceAmount = order.total;
    if (!invoiceAmount || invoiceAmount <= 0) {
      return res.status(400).json({ message: 'Захиалгын дүн буруу байна' });
    }

    const token = await getQPayToken();
    const qRes = await fetch('https://merchant.qpay.mn/v2/invoice', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoice_code: process.env.QPAY_INVOICE_CODE,
        sender_invoice_no: order?.orderNumber || `INV${Date.now()}`,
        invoice_receiver_code: req.user.email,
        invoice_description: `eseller.mn захиалга${order ? ' #' + order.orderNumber : ''}`,
        amount: invoiceAmount,
        callback_url: `${process.env.QPAY_CALLBACK_URL}?orderId=${orderId || ''}`,
      }),
    });

    const invoice = await qRes.json();

    if (order) {
      order.payment.invoiceId = invoice.invoice_id;
      await order.save();
    }

    res.json({
      invoice_id: invoice.invoice_id,
      qr_text: invoice.qr_text,
      qr_image: invoice.qr_image,
      urls: invoice.urls,
    });
  } catch (err) {
    res.status(500).json({ message: 'QPay алдаа: ' + err.message });
  }
});

// GET /payment/qpay/check/:invoiceId
router.get('/qpay/check/:invoiceId', protect, async (req, res) => {
  try {
    const token = await getQPayToken();
    const qRes = await fetch(`https://merchant.qpay.mn/v2/payment/check`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        object_type: 'INVOICE',
        object_id: req.params.invoiceId,
      }),
    });
    const data = await qRes.json();
    const paid = data.count > 0;

    if (paid) {
      const order = await Order.findOne({ 'payment.invoiceId': req.params.invoiceId })
        .populate('items.product', 'name price salePrice emoji category commission store seller');
      if (order && order.payment.status !== 'paid') {
        order.payment.status = 'paid';
        order.payment.paidAt = new Date();
        order.status = 'confirmed';
        await order.save();
        await calculateCommissions(order);
        sendToUser(order.user, 'payment-confirmed', { orderId: order._id, orderNumber: order.orderNumber });
      }
    }

    res.json({ paid, count: data.count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /payment/qpay/callback — QPay webhook
router.post('/qpay/callback', async (req, res) => {
  try {
    // Shared-secret verification — header or query param.
    // Configure QPay webhook URL with ?secret=...
    const expected = process.env.QPAY_WEBHOOK_SECRET;
    if (!expected) {
      console.error('[QPay callback] QPAY_WEBHOOK_SECRET env missing — refusing');
      return res.status(500).json({ ok: false, error: 'Server misconfigured' });
    }
    const provided = req.headers['x-qpay-secret'] || req.query.secret || '';
    if (provided !== expected) {
      console.warn('[QPay callback] Invalid webhook secret', { ip: req.ip });
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    const { orderId } = req.query;
    if (!orderId) return res.json({ ok: true });

    const order = await Order.findById(orderId)
      .populate('items.product', 'name price salePrice emoji category commission store seller');

    if (order && order.payment.status !== 'paid') {
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();
      order.status = 'confirmed';
      await order.save();
      await calculateCommissions(order);
      sendToUser(order.user, 'payment-confirmed', { orderId: order._id, orderNumber: order.orderNumber });
    }

    res.json({ ok: true });
  } catch {
    res.json({ ok: true }); // Always 200 for webhook
  }
});

module.exports = router;
