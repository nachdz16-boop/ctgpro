const mongoose = require('mongoose');

const ProductCodeSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  assignedAt: Date,
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  usedAt: Date,
  expiresAt: Date,
}, { timestamps: true });

ProductCodeSchema.pre('save', function (next) {
  if (!this.code) {
    this.code = 'CODE-' + Math.random().toString(36).substring(2, 12).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('ProductCode', ProductCodeSchema);