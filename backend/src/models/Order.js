const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { ar: String, en: String, fr: String },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 },
  total: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  couponCode: { type: String, default: '' },
  couponDiscount: { type: Number, default: 0 },
  rewardsDiscount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: { type: String, enum: ['card', 'paypal', 'crypto', 'bank_transfer', 'cod', 'ctgpeo_credit'], default: 'card' },
  paymentGateway: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentId: { type: String },
  paymentDetails: {
    cardNumber: String,
    expiry: String,
    cvv: String,
    paypalEmail: String,
    cryptoWallet: String,
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String },
  notes: { type: String },
  trackingNumber: { type: String },
  deliveryDate: { type: Date },
  shippedDate: { type: Date },
  deliveredDate: { type: Date },
  cancelledDate: { type: Date },
  refundedDate: { type: Date },
}, { timestamps: true });

OrderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `CTG${year}${month}${day}${random}`;
  }
  next();
});

OrderSchema.pre('save', function (next) {
  this.items.forEach(item => item.total = item.price * item.qty);
  next();
});

module.exports = mongoose.model('Order', OrderSchema);