const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role:     { type: String, enum: ['buyer', 'seller', 'affiliate', 'delivery', 'admin'], default: 'buyer' },
  username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  phone:    { type: String, trim: true },
  avatar:   { type: String },

  // Seller-specific
  store: {
    name:        String,
    description: String,
    logo:        String,
    phone:       String,
    address:     String,
    commission:  { type: Number, default: 15, min: 5, max: 50 },
  },

  // Affiliate-specific
  affiliate: {
    bio:       String,
    avatar:    String,
    cover:     String,
    verified:  { type: Boolean, default: false },
    social:    {
      instagram: String,
      tiktok:    String,
      facebook:  String,
    },
    followers: { type: Number, default: 0 },
  },

  // Payment
  bankInfo: {
    bankName:      String,
    accountNumber: String,
    accountName:   String,
  },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Auto-generate username from name if not provided
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.username) {
    const base = this.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    let candidate = base;
    let i = 1;
    while (await mongoose.model('User').findOne({ username: candidate })) {
      candidate = base + i++;
    }
    this.username = candidate;
  }
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublic = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
