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
    const { orderId, amount } = req.body;
    const order = orderId ? await Order.findById(orderId) : null;
    const invoiceAmount = amount || order?.total;

    if (!invoiceAmount) return res.status(400).json({ message: 'Дүн шаардлагатай' });

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
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
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
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /payment/qpay/callback — QPay webhook
router.post('/qpay/callback', async (req, res) => {
  try {
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
