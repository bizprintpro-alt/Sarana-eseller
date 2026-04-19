const mongoose = require('mongoose');

// Малчнаас шууд — худалдан авагчийн малчинд өгсөн үнэлгээ.
// Зөвхөн `delivered` төлвийн HerderOrder-той buyer үнэлэх эрхтэй
// (trust gate). Нэг buyer × herder × order дээр зөвхөн 1 review.

const herderReviewSchema = new mongoose.Schema({
  buyer:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',          required: true },
  herder: { type: mongoose.Schema.Types.ObjectId, ref: 'HerderProfile', required: true },
  order:  { type: mongoose.Schema.Types.ObjectId, ref: 'HerderOrder',   required: true },

  rating: { type: Number, required: true, min: 1, max: 5 },
  text:   { type: String, trim: true, maxlength: 500 },

  // Soft-moderation — abusive content hide хийхэд нэмэгдэнэ.
  isHidden: { type: Boolean, default: false },
}, { timestamps: true });

// Нэг захиалга = нэг үнэлгээ.
herderReviewSchema.index({ order: 1 }, { unique: true });
// Профайл дээрх хамгийн сүүлийн үнэлгээг түргэн татах.
herderReviewSchema.index({ herder: 1, createdAt: -1 });

herderReviewSchema.methods.toPublic = function () {
  return {
    id:        this._id,
    rating:    this.rating,
    text:      this.text,
    createdAt: this.createdAt,
    // buyer.populate()-оос name авч нэмэх үүрэг нь route талд
  };
};

module.exports = mongoose.model('HerderReview', herderReviewSchema);
