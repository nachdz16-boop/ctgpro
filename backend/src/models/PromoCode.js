const mongoose = require('mongoose');

const PromoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  minOrderAmount: {
    type: Number,
    default: 0,
  },
  maxDiscount: {
    type: Number,
  },
  expiresAt: {
    type: Date,
  },
  maxUses: {
    type: Number,
    default: null,
  },
  currentUses: {
    type: Number,
    default: 0,
  },
  perUserLimit: {
    type: Number,
    default: 1,
  },
  active: {
    type: Boolean,
    default: true,
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  applicableCategories: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

PromoCodeSchema.methods.isValid = function () {
  if (!this.active) return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  if (this.maxUses && this.currentUses >= this.maxUses) return false;
  return true;
};

PromoCodeSchema.methods.applyDiscount = function (amount) {
  if (!this.isValid()) return amount;
  
  let discount = 0;
  if (this.type === 'percentage') {
    discount = amount * (this.value / 100);
    if (this.maxDiscount) {
      discount = Math.min(discount, this.maxDiscount);
    }
  } else if (this.type === 'fixed') {
    discount = this.value;
  }
  return Math.max(0, amount - discount);
};

module.exports = mongoose.model('PromoCode', PromoCodeSchema);