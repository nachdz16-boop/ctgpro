const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const config = require('./config/config');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const PaymentGateway = require('./models/PaymentGateway');
const AiBot = require('./models/AiBot');

// Import routes (safe require to avoid crash if optional route files are missing)
const safeRequire = (p) => {
  try {
    return require(p);
  } catch (err) {
    console.warn(`Route ${p} not found, skipping.`);
    const express = require('express');
    return express.Router();
  }
};

const authRoutes = safeRequire('./routes/authRoutes');
const productRoutes = safeRequire('./routes/productRoutes');
const cartRoutes = safeRequire('./routes/cartRoutes');
const orderRoutes = safeRequire('./routes/orderRoutes');
const wishlistRoutes = safeRequire('./routes/wishlistRoutes');
const sellerRoutes = safeRequire('./routes/sellerRoutes');
const walletRoutes = safeRequire('./routes/walletRoutes');
const notificationRoutes = safeRequire('./routes/notificationRoutes');
const paymentGatewayRoutes = safeRequire('./routes/paymentGatewayRoutes');
const adminRoutes = safeRequire('./routes/adminRoutes');
const adminBotRoutes = safeRequire('./routes/adminBotRoutes');
const storeBotRoutes = safeRequire('./routes/storeBotRoutes');
const adminAdRoutes = safeRequire('./routes/adminAdRoutes');
const disputeRoutes = safeRequire('./routes/disputeRoutes');
const storeRoutes = safeRequire('./routes/storeRoutes');

const app = express();

const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser clients and same-origin requests with no Origin header.
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
};

// Connect to MongoDB
connectDB();
PaymentGateway.seedDefaultPaymentGateways().catch((err) => {
  console.error('Failed to seed default payment gateways', err);
});
AiBot.seedDefaultAiBot().catch((err) => {
  console.error('Failed to seed default AI bot', err);
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting
app.use('/api/auth', rateLimiter.authLimiter);
app.use('/api', rateLimiter.apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payment-gateways', paymentGatewayRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminBotRoutes);
app.use('/api/store-bot', storeBotRoutes);
app.use('/api/admin', adminAdRoutes);
app.use('/api/admin/disputes', disputeRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/store', storeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

module.exports = app;