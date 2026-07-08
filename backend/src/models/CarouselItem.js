const mongoose = require('mongoose');

const CarouselItemSchema = new mongoose.Schema({
  title: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
    fr: { type: String },
  },
  description: {
    ar: String,
    en: String,
    fr: String,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  imageAlt: {
    ar: String,
    en: String,
    fr: String,
  },
  linkUrl: String,
  buttonText: {
    ar: String,
    en: String,
    fr: String,
  },
  buttonColor: {
    type: String,
    default: '#a855f7',
  },
  order: {
    type: Number,
    default: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
  startDate: Date,
  endDate: Date,
  type: {
    type: String,
    enum: ['hero', 'promo', 'banner'],
    default: 'hero',
  },
}, { timestamps: true });

module.exports = mongoose.model('CarouselItem', CarouselItemSchema);