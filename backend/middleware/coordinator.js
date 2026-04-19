// Coordinator middleware — зөвхөн coordinator role + province scope-тэй
// хэрэглэгчид /herder/coordinator/* endpoint-үүдэд хандах.
// Admin бүх аймагт хандах боломжтой (scope шалгахгүй).
//
// `protect` middleware-ийн дараа ашиглана — req.user set байх ёстой.
// req.coordinatorScope-д [province codes] array-г set хийж үлдээнэ,
// handler-ууд filter-д ашиглаж болно.

const requireCoordinator = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Нэвтэрнэ үү' });
    }
    if (req.user.role !== 'coordinator' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Зөвхөн координатор хандах боломжтой' });
    }

    if (req.user.role === 'admin') {
      // Admin → бүх province. null = no filter (handler шалгана)
      req.coordinatorScope = null;
      return next();
    }

    const provinces = Array.isArray(req.user.coordinatorProvinces)
      ? req.user.coordinatorProvinces.filter(Boolean).map((p) => String(p).toUpperCase())
      : [];

    if (provinces.length === 0) {
      return res.status(403).json({
        message: 'Танд хариуцах аймаг тохируулаагүй байна. Админтай холбогдоно уу.',
      });
    }

    req.coordinatorScope = provinces;
    next();
  } catch (err) {
    console.error('[requireCoordinator]', err);
    res.status(500).json({ message: 'Серверийн алдаа' });
  }
};

module.exports = { requireCoordinator };
