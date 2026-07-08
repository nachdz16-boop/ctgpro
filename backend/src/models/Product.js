const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    ar: { type: String, required: true, trim: true },
    en: { type: String, required: true, trim: true },
    fr: { type: String, trim: true },
  },
  description: {
    ar: { type: String, default: '' },
    en: { type: String, default: '' },
    fr: { type: String, default: '' },
  },
  category: {
    type: String,
    enum: ['topup', 'giftcards', 'cdkeys', 'gamecards', 'recharge'],
    required: true,
    default: 'topup',
  },
  productType: {
    type: String,
    enum: ['digital', 'game_topup', 'mobile_recharge', 'invoice', 'international'],
    default: 'digital',
  },
  // Game Top-up
  game: { type: String, enum: ['pubg', 'freefire', 'mlbb', 'cod', 'genshin', 'fortnite', 'roblox', 'valorant', ''], default: '' },
  gameServers: { type: [String], default: [] },
  gameAmounts: { type: [Number], default: [] },
  gamePricePerUnit: { type: Number, default: 0 },
  // Mobile Recharge
  operator: { type: String, enum: ['djezzy', 'ooredoo', 'mobilis', ''], default: '' },
  operatorCode: { type: String, default: '' },
  operatorAmounts: { type: [Number], default: [] },
  operatorPricePerUnit: { type: Number, default: 0 },
  // General
  price: { type: Number, required: true, default: 0 },
  oldPrice: { type: Number, default: null },
  stock: { type: Number, required: true, default: 0 },
  image: { type: String, default: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80' },
  images: { type: [String], default: [] },
  platform: { type: String, default: 'عام' },
  region: { type: String, default: 'Global' },
  deliveryTime: { type: String, default: 'فوري' },
  badge: { type: String, enum: ['hot', 'sale', 'new', ''], default: '' },
  tag: {
    ar: { type: String, default: '' },
    en: { type: String, default: '' },
    fr: { type: String, default: '' },
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isFlashSale: { type: Boolean, default: false },
  flashSaleEnd: { type: Date, default: null },
  flashSaleDiscount: { type: Number, min: 0, max: 100, default: null },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  seoKeywords: { type: String, default: '' },
  views: { type: Number, default: 0 },
  purchases: { type: Number, default: 0 },
}, { timestamps: true });

ProductSchema.index({ 'name.ar': 'text', 'name.en': 'text', 'name.fr': 'text' });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ productType: 1 });
ProductSchema.index({ sellerId: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ rating: -1 });

ProductSchema.virtual('discountPercentage').get(function () {
  if (this.oldPrice && this.oldPrice > this.price) {
    return Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100);
  }
  return 0;
});

ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', ProductSchema);