const mongoose = require('mongoose');
const { HERDER_CATEGORIES, PROVINCE_CODES } = require('./HerderProfile');

const herderProductSchema = new mongoose.Schema({
  herder: { type: mongoose.Schema.Types.ObjectId, ref: 'HerderProfile', required: true },

  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  price:       { type: Number, required: true, min: 0 },
  salePrice:   { type: Number, min: 0, default: null },
  category:    { type: String, enum: HERDER_CATEGORIES, required: true },
  images:      [{ type: String }],
  stock:       { type: Number, default: 0, min: 0 },

  // Шинэхэн/хөлдөөсөн бүтээгдэхүүн — cold-chain хүргэлт шаардлагатай эсэх
  requiresColdChain: { type: Boolean, default: false },

  // Herder-ийн province-аас denormalize — хурдан шүүлт
  province: { type: String, enum: PROVINCE_CODES, required: true, uppercase: true },

  soldCount: { type: Number, default: 0 },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

herderProductSchema.index({ name: 'text', description: 'text' });
herderProductSchema.index({ province: 1, category: 1, isActive: 1 });
herderProductSchema.index({ herder: 1, isActive: 1 });
herderProductSchema.index({ createdAt: -1 });

module.exports = mongoose.model('HerderProduct', herderProductSchema);
