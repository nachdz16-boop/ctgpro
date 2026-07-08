const mongoose = require('mongoose');

const HomepageSectionSchema = new mongoose.Schema({
  sectionType: {
    type: String,
    enum: ['hero', 'features', 'categories', 'products', 'testimonials', 'stats', 'cta'],
    required: true,
  },
  title: {
    ar: String,
    en: String,
    fr: String,
  },
  subtitle: {
    ar: String,
    en: String,
    fr: String,
  },
  content: {
    ar: String,
    en: String,
    fr: String,
  },
  imageUrl: String,
  videoUrl: String,
  ctaText: {
    ar: String,
    en: String,
    fr: String,
  },
  ctaUrl: String,
  ctaColor: String,
  order: {
    type: Number,
    default: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
  },
}, { timestamps: true });

module.exports = mongoose.model('HomepageSection', HomepageSectionSchema);