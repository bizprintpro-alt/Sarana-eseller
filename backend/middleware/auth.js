const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT token verify
const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Нэвтэрнэ үү' });
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ message: 'Хэрэглэгч олдсонгүй' });
    }
    next();
  } catch {
    return res.status(401).json({ message: 'Token хүчингүй' });
  }
};

// Role check
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Эрх хүрэлцэхгүй байна' });
  }
  next();
};

// Generate JWT
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = { protect, authorize, signToken };
