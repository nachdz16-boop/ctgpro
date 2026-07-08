const mongoose = require('mongoose');

const SellerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, trim: true },
  storeName: { type: String, trim: true, default: '' },
  address: { type: String, trim: true, default: '' },
  avatar: { type: String, default: '' },
  bio: { type: String, maxlength: 500 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalSales: { type: Number, default: 0 },
  totalProducts: { type: Number, default: 0 },
  joinedDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'active', 'suspended', 'inactive'], default: 'pending' },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountHolder: String,
    iban: String,
  },
  commissionRate: { type: Number, default: 0.1 },
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
    website: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Seller', SellerSchema);