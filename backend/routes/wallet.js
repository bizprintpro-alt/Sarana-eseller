const router = require('express').Router();
const Wallet = require('../models/Wallet');
const { protect } = require('../middleware/auth');

// GET /wallet
router.get('/', protect, async (req, res) => {
  try {
    const wallet = await Wallet.getOrCreate(req.user._id);
    res.json({
      balance:  wallet.balance,
      pending:  wallet.pending,
      withdrawn: wallet.withdrawn,
      total:    wallet.balance + wallet.pending + wallet.withdrawn,
      transactions: wallet.transactions.slice(-20).reverse(),
    });
  } catch (err) {
    console.error('[wallet]', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

// POST /wallet/withdraw
router.post('/withdraw', protect, async (req, res) => {
  try {
    const { amount: rawAmount, method, bankCode, accountNumber } = req.body;
    // Coerce then validate — rejects strings, NaN, Infinity, non-integers, negatives.
    const amount = Number(rawAmount);
    if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount < 10000) {
      return res.status(400).json({ message: 'Дор хаяж ₮10,000 татах боломжтой' });
    }
    const wallet = await Wallet.getOrCreate(req.user._id);
    if (amount > wallet.balance) {
      return res.status(400).json({ message: 'Үлдэгдэл хүрэлцэхгүй' });
    }

    wallet.balance -= amount;
    wallet.withdrawn += amount;
    wallet.transactions.push({
      type: 'withdraw',
      amount: -amount,
      note: `Мөнгө татах хүсэлт`,
      status: 'pending',
      bankInfo: {
        bankName:      String(bankCode || method || '').slice(0, 100),
        accountNumber: String(accountNumber || '').slice(0, 100),
        accountName:   req.user.name,
      },
    });
    await wallet.save();

    res.json({ message: 'Татах хүсэлт илгээгдлээ', wallet });
  } catch (err) {
    console.error('[wallet]', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
});

module.exports = router;
