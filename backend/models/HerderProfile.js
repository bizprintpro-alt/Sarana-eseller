const mongoose = require('mongoose');

// Категор PRD §6.2 — mobile src/features/herder/constants.ts-тэй синк байх ёстой
const HERDER_CATEGORIES = ['мах', 'ноос', 'арьс', 'сүү', 'бяслаг', 'дэгэл', 'аарц', 'тараг'];

// Аймгийн код — mobile constants.ts-тэй матч
const PROVINCE_CODES = [
  'AKH', 'BOL', 'BKH', 'BUL', 'GOA', 'GOS', 'DAR', 'DOR', 'DOG', 'DUN',
  'ZAV', 'OVR', 'OMN', 'SUK', 'SEL', 'TOV', 'UVS', 'KHO', 'KHV', 'KHE', 'ORK',
];

const herderProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  firstName:      { type: String, required: true, trim: true },
  lastName:       { type: String, required: true, trim: true },
  registerNumber: { type: String, required: true, trim: true, match: /^[А-ЯЁӨҮа-яёөү]{2}\d{8}$/ },
  phone:          { type: String, required: true, trim: true },

  province:     { type: String, required: true, enum: PROVINCE_CODES, uppercase: true },
  provinceName: { type: String, required: true, trim: true },
  district:     { type: String, required: true, trim: true },

  aDansNumber: { type: String, trim: true },
  vetCertUri:  { type: String, trim: true },

  livestock: {
    horse: { type: Number, default: 0, min: 0 },
    cow:   { type: Number, default: 0, min: 0 },
    sheep: { type: Number, default: 0, min: 0 },
    goat:  { type: Number, default: 0, min: 0 },
    camel: { type: Number, default: 0, min: 0 },
  },

  bankInfo: {
    bankName:      { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    accountName:   { type: String, trim: true },
  },

  gps: {
    latitude:  Number,
    longitude: Number,
  },

  notes: { type: String, trim: true },

  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending',
  },
  rejectionReason: String,
  reviewedAt:      Date,
  reviewedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  isVerified: { type: Boolean, default: false },
  rating:     { type: Number, default: 0, min: 0, max: 5 },
  orderCount: { type: Number, default: 0 },

  bio:         { type: String, trim: true },
  coverImage:  String,
  avatar:      String,

  stats: {
    deliverySuccessRate: { type: Number, default: 0, min: 0, max: 1 },
    onTimeRate:          { type: Number, default: 0, min: 0, max: 1 },
    productCount:        { type: Number, default: 0 },
  },
}, { timestamps: true });

herderProfileSchema.index({ province: 1, status: 1, isVerified: 1 });
herderProfileSchema.index({ status: 1, createdAt: -1 });
herderProfileSchema.index({ registerNumber: 1 }, { unique: true });

// Public projection — хэрэглэгчид буцаах талбарууд
herderProfileSchema.methods.toPublic = function () {
  return {
    id:           this._id,
    herderName:   `${this.firstName} ${this.lastName}`,
    province:     this.province,
    provinceName: this.provinceName,
    district:     this.district,
    isVerified:   this.isVerified,
    rating:       this.rating,
    orderCount:   this.orderCount,
    bio:          this.bio,
    joinedAt:     this.createdAt,
    livestock:    this.livestock,
    coverImage:   this.coverImage,
    avatar:       this.avatar,
    stats:        this.stats,
  };
};

module.exports = mongoose.model('HerderProfile', herderProfileSchema);
module.exports.HERDER_CATEGORIES = HERDER_CATEGORIES;
module.exports.PROVINCE_CODES = PROVINCE_CODES;
