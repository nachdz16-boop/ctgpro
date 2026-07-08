const mongoose = require('mongoose');

const StoreSettingsSchema = new mongoose.Schema({
  name: { type: String, default: 'CTGPRO' },
  description: { type: String, default: '' },
  email: { type: String, default: 'info@ctgpro.com' },
  phone: { type: String, default: '+213 5 55 55 55 55' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  country: { type: String, default: '' },
  logo: { type: String, default: '' },
  favicon: { type: String, default: '' },
  currency: { type: String, default: 'USD' },
  language: { type: String, default: 'ar' },
  timezone: { type: String, default: 'Africa/Algiers' },
  maintenance: { type: Boolean, default: false },
  maintenanceMessage: { type: String, default: '' },
  registrationEnabled: { type: Boolean, default: true },
  emailVerification: { type: Boolean, default: true },
  twoFactorAuth: {
    enabled: { type: Boolean, default: false },
    method: { type: String, default: 'app' },
    phoneNumber: { type: String, default: '' },
    backupCodes: { type: [String], default: [] }
  },
  security: {
    sessionTimeout: { type: Number, default: 30 },
    maxLoginAttempts: { type: Number, default: 5 },
    passwordPolicy: {
      minLength: { type: Number, default: 8 },
      requireUppercase: { type: Boolean, default: true },
      requireLowercase: { type: Boolean, default: true },
      requireNumbers: { type: Boolean, default: true },
      requireSpecialChars: { type: Boolean, default: true }
    },
    ipWhitelist: { type: [String], default: [] },
    ipBlacklist: { type: [String], default: [] }
  },
  database: {
    host: { type: String, default: 'localhost' },
    port: { type: Number, default: 27017 },
    name: { type: String, default: 'ctgpro' },
    user: { type: String, default: '' },
    password: { type: String, default: '' },
    replicaSet: { type: Boolean, default: false },
    backupEnabled: { type: Boolean, default: true },
    backupFrequency: { type: String, default: 'daily' },
    backupTime: { type: String, default: '02:00' },
    retentionDays: { type: Number, default: 30 },
    compressionEnabled: { type: Boolean, default: true }
  },
  performance: {
    cacheEnabled: { type: Boolean, default: true },
    cacheDuration: { type: Number, default: 3600 },
    compressionEnabled: { type: Boolean, default: true },
    lazyLoading: { type: Boolean, default: true },
    imageOptimization: { type: Boolean, default: true },
    minifyAssets: { type: Boolean, default: true },
    cdnEnabled: { type: Boolean, default: true },
    cdnUrl: { type: String, default: '' },
    dbPoolSize: { type: Number, default: 10 },
    queryOptimization: { type: Boolean, default: true },
    indexingEnabled: { type: Boolean, default: true }
  },
  social: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' },
    tiktok: { type: String, default: '' },
    telegram: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    facebookPixelId: { type: String, default: '' },
    tiktokPixelId: { type: String, default: '' },
    googleAnalyticsId: { type: String, default: '' },
  },
  appearance: {
    theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
    productGridColumns: { type: Number, default: 4 },
    cardStyle: { type: String, enum: ['standard', 'compact', 'large'], default: 'standard' },
    primaryColor: { type: String, default: '#1d4ed8' },
    pageLayout: { type: String, enum: ['default', 'full_width', 'boxed'], default: 'default' },
  },
  payment: {
    methods: { type: [String], default: ['credit_card', 'paypal', 'crypto'] },
    currency: { type: String, default: 'USD' },
    taxRate: { type: Number, default: 0.05 },
    shippingCost: { type: Number, default: 5.0 },
    freeShippingThreshold: { type: Number, default: 50 },
    currencies: {
      type: [
        {
          code: String,
          name: String,
          symbol: String,
          rate: Number,
          status: String,
        },
      ],
      default: [
        { code: 'USD', name: 'دولار أمريكي', symbol: '$', rate: 1, status: 'active' },
        { code: 'EUR', name: 'يورو', symbol: '€', rate: 0.92, status: 'active' },
        { code: 'GBP', name: 'جنيه إسترليني', symbol: '£', rate: 0.79, status: 'active' },
        { code: 'DZD', name: 'دينار جزائري', symbol: 'دج', rate: 135, status: 'active' },
        { code: 'BTC', name: 'بيتكوين', symbol: '₿', rate: 0.000015, status: 'active' },
      ],
    },
  },
  files: {
    type: [
      {
        filename: String,
        originalname: String,
        mimetype: String,
        size: Number,
        type: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    default: []
  },
  logs: {
    type: [
      {
        timestamp: { type: Date, default: Date.now },
        type: { type: String, default: 'info' },
        message: String,
        ip: String,
        details: mongoose.Schema.Types.Mixed
      }
    ],
    default: []
  },
  backups: {
    type: [
      {
        backupId: String,
        filename: String,
        path: String,
        size: Number,
        snapshot: mongoose.Schema.Types.Mixed,
        createdAt: { type: Date, default: Date.now }
      }
    ],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('StoreSettings', StoreSettingsSchema);
