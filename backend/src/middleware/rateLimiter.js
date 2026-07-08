const rateLimit = require('express-rate-limit');

const isProd = process.env.NODE_ENV === 'production';

const authLimiter = rateLimit({
  windowMs: isProd ? 15 * 60 * 1000 : 60 * 1000,
  max: isProd ? 10 : 1000,
  message: { success: false, message: isProd ? 'العديد من محاولات الدخول. الرجاء المحاولة بعد 15 دقيقة' : 'العديد من الطلبات خلال التطوير — تجاوز الحد مؤقتاً' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res /*, next */) => {
    try {
      console.warn('Rate limit hit (auth):', { ip: req.ip, method: req.method, route: req.originalUrl });
    } catch (e) {
      console.warn('Rate limit hit (auth) - failed to log details');
    }
    return res.status(429).json({ success: false, message: 'Too many requests (rate limited)' });
  },
});

const apiLimiter = rateLimit({
  windowMs: isProd ? 60 * 1000 : 10 * 1000,
  max: isProd ? 60 : 5000,
  message: { success: false, message: isProd ? 'العديد من الطلبات. الرجاء المحاولة لاحقاً' : 'العديد من الطلبات خلال التطوير — تجاوز الحد مؤقتاً' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res /*, next */) => {
    try {
      console.warn('Rate limit hit (api):', { ip: req.ip, method: req.method, route: req.originalUrl });
    } catch (e) {
      console.warn('Rate limit hit (api) - failed to log details');
    }
    return res.status(429).json({ success: false, message: 'Too many requests (rate limited)' });
  },
});

module.exports = { authLimiter, apiLimiter };