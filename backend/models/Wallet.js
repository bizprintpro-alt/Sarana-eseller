const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance:   { type: Number, default: 0, min: 0 },
  pending:   { type: Number, default: 0, min: 0 },  // хүргэлт хийгдээгүй захиалгын орлого
  withdrawn: { type: Number, default: 0, min: 0 },
  transactions: [{
    type:      { type: String, enum: ['earn', 'withdraw', 'refund', 'bonus'] },
    amount:    Number,
    orderId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    note:      String,
    status:    { type: String, enum: ['pending', 'completed', 'rejected'], default: 'completed' },
    bankInfo:  {
      bankName:      String,
      accountNumber: String,
      accountName:   String,
    },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

walletSchema.statics.getOrCreate = async function(userId) {
  let wallet = await this.findOne({ user: userId });
  if (!wallet) wallet = await this.create({ user: userId });
  return wallet;
};

module.exports = mongoose.model('Wallet', walletSchema);
