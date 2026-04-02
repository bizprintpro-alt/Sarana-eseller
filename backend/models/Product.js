const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price:       { type: Number, required: true, min: 0 },
  salePrice:   { type: Number, min: 0 },
  category:    { type: String, default: 'other', enum: ['fashion', 'food', 'electronics', 'beauty', 'home', 'sports', 'digital', 'services', 'other'] },
  images:      [{ type: String }],
  emoji:       { type: String },
  stock:       { type: Number, default: 0, min: 0 },
  commission:  { type: Number, default: 15, min: 0, max: 50 }, // Affiliate commission %

  seller:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  store:   {
    name: String,
    _id:  mongoose.Schema.Types.ObjectId,
  },

  rating:      { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  soldCount:   { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ seller: 1 });

module.exports = mongoose.model('Product', productSchema);
