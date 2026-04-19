const router = require('express').Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// GET /products — Бараа жагсаалт (нийтэд нээлттэй)
router.get('/', async (req, res) => {
  try {
    const { search, category, seller, creator, limit = 60, page = 1 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (seller)   filter.seller = seller;
    if (search)   filter.$text = { $search: search };

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('seller', 'name username store');

    const total = await Product.countDocuments(filter);
    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name username store');
    if (!product) return res.status(404).json({ message: 'Бараа олдсонгүй' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /products — Бараа нэмэх (seller/admin)
router.post('/', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const { name, description, price, salePrice, category, images, emoji, stock, commission } = req.body;
    const product = await Product.create({
      name, description, price, salePrice, category, images, emoji, stock, commission,
      seller: req.user._id,
      store: { name: req.user.store?.name || req.user.name, _id: req.user._id },
    });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /products/:id
router.put('/:id', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Бараа олдсонгүй' });
    if (String(product.seller) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Эрх хүрэлцэхгүй' });
    }
    const { name, description, price, salePrice, category, images, emoji, stock, commission, isActive } = req.body;
    Object.assign(product, { name, description, price, salePrice, category, images, emoji, stock, commission, isActive });
    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /products/:id
router.delete('/:id', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Бараа олдсонгүй' });
    if (String(product.seller) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Эрх хүрэлцэхгүй' });
    }
    product.isActive = false;
    await product.save();
    res.json({ message: 'Устгагдлаа' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /products/upload — Зураг upload (Cloudinary)
router.post('/upload', protect, authorize('seller', 'admin'), upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Зураг оруулна уу' });
  res.json({ url: req.file.path, public_id: req.file.filename });
});

module.exports = router;
