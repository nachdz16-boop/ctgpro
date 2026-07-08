const mongoose = require('mongoose');

const PageSchema = new mongoose.Schema({
  title: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
    fr: { type: String },
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  content: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
    fr: { type: String },
  },
  metaDescription: {
    ar: String,
    en: String,
    fr: String,
  },
  metaKeywords: {
    ar: String,
    en: String,
    fr: String,
  },
  published: {
    type: Boolean,
    default: true,
  },
  featuredImage: String,
  template: {
    type: String,
    enum: ['default', 'full_width', 'landing'],
    default: 'default',
  },
}, { timestamps: true });

PageSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    const slug = this.title.ar || this.title.en || 'page';
    this.slug = slug
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Page', PageSchema);