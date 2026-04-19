const router = require('express').Router();
const User = require('../models/User');
const { protect, signToken } = require('../middleware/auth');

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Бүх талбарыг бөглөнө үү' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Энэ имэйл бүртгэлтэй байна' });

    const user = await User.create({ name, email, password, role: role || 'buyer' });
    const token = signToken(user._id);
    res.status(201).json({ token, user: user.toPublic() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Имэйл, нууц үг оруулна уу' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Имэйл эсвэл нууц үг буруу' });
    }
    const token = signToken(user._id);
    res.json({ token, user: user.toPublic() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /auth/me
router.get('/me', protect, (req, res) => {
  res.json(req.user.toPublic());
});

module.exports = router;
