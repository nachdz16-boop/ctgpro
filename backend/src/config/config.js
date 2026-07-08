require('dotenv').config();

const parseBoolean = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === 'true';
};

const parseCsv = (value = '') =>
  String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const nodeEnv = process.env.NODE_ENV || 'development';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const extraAllowedOrigins = parseCsv(process.env.ALLOWED_ORIGINS || '');
const defaultDevOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];
const allowedOrigins = Array.from(new Set([
  frontendUrl,
  ...(nodeEnv === 'production' ? [] : defaultDevOrigins),
  ...extraAllowedOrigins,
].filter(Boolean)));

const demoPaymentsEnabled = parseBoolean(
  process.env.ENABLE_DEMO_PAYMENTS,
  nodeEnv !== 'production'
);

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ctgpro',
  jwtSecret: process.env.JWT_SECRET || 'ctgpro_super_secret_jwt_key_2024',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  frontendUrl,
  cors: {
    allowedOrigins,
  },
  email: {
    enabled: process.env.EMAIL_ENABLED !== 'false',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    fromName: process.env.EMAIL_FROM_NAME || 'CTGPRO',
    fromAddress: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER || '',
  },
  payments: {
    demoEnabled: demoPaymentsEnabled,
    allowedMethods: demoPaymentsEnabled
      ? ['card', 'paypal', 'crypto', 'bank_transfer', 'cod', 'ctgpeo_credit']
      : ['paypal', 'bank_transfer', 'ctgpeo_credit'],
  },
  health: {
    exposeDetails: parseBoolean(process.env.HEALTH_EXPOSE_DETAILS, nodeEnv !== 'production'),
  },
  upload: {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
  pagination: {
    defaultLimit: 12,
    maxLimit: 50,
  },
};