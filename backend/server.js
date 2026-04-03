require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// ── DB Connect ──
connectDB();

// ── Security ──
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(mongoSanitize());
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    // Allow all Vercel deployments
    if (origin.includes('vercel.app')) return callback(null, true);
    // Allow eseller.mn and subdomains
    if (origin.includes('eseller.mn')) return callback(null, true);
    // Allow localhost
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) return callback(null, true);
    // Allow custom FRONTEND_URL
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true);
    // Block others
    callback(null, false);
  },
  credentials: true,
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { message: 'Хэт олон хүсэлт. Хэсэг хүлээнэ үү.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Хэт олон нэвтрэх оролдлого' },
});

// ── Body parsing ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ──
app.use('/api/auth',          authLimiter, require('./routes/auth'));
app.use('/api/products',      apiLimiter,  require('./routes/products'));
app.use('/api/orders',        apiLimiter,  require('./routes/orders'));
app.use('/api/payment',       apiLimiter,  require('./routes/payment'));
app.use('/api/affiliate',     apiLimiter,  require('./routes/affiliate'));
app.use('/api/wallet',        apiLimiter,  require('./routes/wallet'));
app.use('/api/admin',         apiLimiter,  require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Серверийн алдаа'
      : err.message,
  });
});

// ── Start ──
app.listen(PORT, () => {
  console.log(`eseller.mn backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
