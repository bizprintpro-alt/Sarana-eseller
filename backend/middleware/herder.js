const HerderProfile = require('../models/HerderProfile');

// Тухайн route-г зөвхөн approved малчинд нээнэ.
// `protect` middleware-ээс хойш ашиглана — req.user баталгаажсан байх ёстой.
// req.herderProfile-ыг set хийж үлдэнэ, handler-ууд ашиглаж болно.
const requireHerder = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Нэвтэрнэ үү' });
    }
    // Role нь herder байх
    if (req.user.role !== 'herder' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Зөвхөн баталгаажсан малчин хандах боломжтой' });
    }
    // Profile approved байх
    const profile = await HerderProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(403).json({ message: 'Малчны профайл олдсонгүй' });
    }
    if (profile.status !== 'approved') {
      return res.status(403).json({
        message: 'Таны өргөдөл хянагдаж байна',
        status:  profile.status,
      });
    }
    req.herderProfile = profile;
    next();
  } catch (err) {
    console.error('[requireHerder]', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
};

module.exports = { requireHerder };
