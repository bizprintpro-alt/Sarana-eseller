const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },

  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  items: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:     String,
    price:    Number,
    quantity: { type: Number, default: 1, min: 1 },
    emoji:    String,
  }],

  total:       { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },

  // Full fulfillment pipeline. Keep in sync with:
  //   web:    nextjs/.../orders/page.tsx STATUS
  //   mobile: eseller-mobile/app/(tabs)/orders.tsx STATUS
  //   seller: eseller-mobile/app/(owner)/orders.tsx NEXT_STATUS
  // `shipped` was the legacy two-state rollup; migrated rows that still
  // carry it are treated as `delivering` in UI layers until backfilled.
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'handed_to_driver',
      'delivering',
      'delivered',
      'cancelled',
      'shipped', // deprecated — kept so old docs don't fail validation; do not emit from new writes
    ],
    default: 'pending',
  },

  payment: {
    method:    { type: String, enum: ['qpay', 'card', 'cash', 'wallet'], default: 'qpay' },
    status:    { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    invoiceId: String,
    paidAt:    Date,
  },

  delivery: {
    address: {
      city:     { type: String, default: 'Улаанбаатар' },
      district: String,
      street:   String,
      building: String,
      note:     String,
    },
    phone:    String,
    receiver: String,
    preferredTime: String,
    driver:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pickedAt: Date,
    deliveredAt: Date,
  },

  // Affiliate tracking
  referralCode: { type: String },
  affiliate:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Commission breakdown (тооцоологдсоны дараа)
  commissions: {
    seller:    { type: Number, default: 0 },
    affiliate: { type: Number, default: 0 },
    platform:  { type: Number, default: 0 },
    delivery:  { type: Number, default: 0 },
    calculated: { type: Boolean, default: false },
  },
}, { timestamps: true });

// Auto-generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = 'DS' + String(30000 + count).padStart(5, '0');
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ referralCode: 1 });
orderSchema.index({ 'payment.status': 1 });

module.exports = mongoose.model('Order', orderSchema);
