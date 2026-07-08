const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  qty: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
});

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [CartItemSchema],
  couponCode: { type: String },
}, { timestamps: true });

CartSchema.methods.getTotal = function () {
  let total = 0;
  for (const item of this.items) {
    total += item.price * item.qty;
  }
  return total;
};

module.exports = mongoose.model('Cart', CartSchema);