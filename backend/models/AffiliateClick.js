const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  referralCode: { type: String, required: true, index: true },
  affiliate:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  page:         { type: String },
  ip:           { type: String },
  userAgent:    { type: String },
  converted:    { type: Boolean, default: false }, // худалдан авалт болсон эсэх
  orderId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
}, { timestamps: true });

// TTL: 90 хоногийн дараа автомат устгах
clickSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('AffiliateClick', clickSchema);
