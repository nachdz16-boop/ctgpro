const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 3 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'seller', 'admin', 'super_admin'], default: 'user' },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', default: null },
  
  // ===== حقول جديدة =====
  username: { type: String, unique: true, sparse: true },
  isAdmin: { type: Boolean, default: false },
  banned: { type: Boolean, default: false },
  banReason: String,
  bannedAt: Date,
  walletBalance: { type: Number, default: 0 },
  
  referralCode: { type: String, unique: true, sparse: true },
  referralCount: { type: Number, default: 0 },
  rewards: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'الجزائر' },
  },
  preferences: {
    language: { type: String, enum: ['ar', 'en', 'fr'], default: 'ar' },
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    currency: { type: String, enum: ['USD', 'EUR', 'GBP', 'DZD', 'SAR', 'AED', 'BTC', 'ETH', 'USDT'], default: 'USD' },
    notifications: { type: Boolean, default: true },
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  verifyEmailToken: String,
  verifyEmailExpire: Date,
  
  walletTransactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WalletTransaction',
  }],
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.pre('save', function (next) {
  if (!this.referralCode) {
    this.referralCode = 'CTG' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  if (!this.username && this.name) {
    this.username = this.name.replace(/\s/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);