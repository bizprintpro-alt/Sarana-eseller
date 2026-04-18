const mongoose = require('mongoose');

// Малчнаас шууд — захиалгын бие даасан flow.
// Энгийн Order-той холбогдуулалгүй: cold-chain SLA, аймаг/сум хүргэлт,
// escrow hold period нь бие даасан business logic-тэй тул тус моделд хадгална.

const herderOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },

  // Худалдан авагч
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Нэг захиалга = нэг малчин (нэг түрийвчээс нэг удаагийн escrow)
  herder: { type: mongoose.Schema.Types.ObjectId, ref: 'HerderProfile', required: true },

  items: [{
    product:   { type: mongoose.Schema.Types.ObjectId, ref: 'HerderProduct' },
    name:      String,
    price:     Number,
    quantity:  { type: Number, default: 1, min: 1 },
    subtotal:  Number,
  }],

  subtotal:    { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  total:       { type: Number, required: true },

  // PRD commission — малчнаас 8-12%, default 10% (admin-аар тохируулах)
  commissionRate: { type: Number, default: 10, min: 0, max: 20 },
  commission:     { type: Number, default: 0 }, // MNT

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  statusHistory: [{
    status:    String,
    at:        { type: Date, default: Date.now },
    byUserId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    byRole:    String,    // 'buyer' | 'herder' | 'admin' | 'system'
    note:      String,
  }],

  // Escrow — buyer пэй → held → delivered + 48h → release to herder
  escrow: {
    holdAmount: { type: Number, default: 0 },       // herder-т очих хэсэг
    platformFee: { type: Number, default: 0 },      // commission
    status:      { type: String, enum: ['pending', 'held', 'released', 'refunded'], default: 'pending' },
    heldAt:      Date,
    releaseAt:   Date,    // delivered_at + HOLD_HOURS
    releasedAt:  Date,
  },

  payment: {
    method:    { type: String, enum: ['qpay', 'card', 'cash', 'wallet'], default: 'qpay' },
    status:    { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    invoiceId: String,
    paidAt:    Date,
  },

  delivery: {
    address: {
      province: String,
      district: String,
      street:   String,
      note:     String,
    },
    phone:    String,
    receiver: String,
    requiresColdChain: { type: Boolean, default: false },
    shippedAt:   Date,
    deliveredAt: Date,
    driver:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    trackingCode: String,
  },

  cancelledBy: { type: String, enum: ['buyer', 'herder', 'admin', 'system'] },
  cancelReason: String,
}, { timestamps: true });

herderOrderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('HerderOrder').countDocuments();
    this.orderNumber = 'H' + String(10000 + count).padStart(6, '0');
  }
  next();
});

herderOrderSchema.index({ herder: 1, status: 1, createdAt: -1 });
herderOrderSchema.index({ buyer: 1, createdAt: -1 });
herderOrderSchema.index({ status: 1 });
herderOrderSchema.index({ 'escrow.status': 1, 'escrow.releaseAt': 1 });

module.exports = mongoose.model('HerderOrder', herderOrderSchema);
