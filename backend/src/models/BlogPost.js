const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
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
  excerpt: {
    ar: String,
    en: String,
    fr: String,
  },
  content: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
    fr: { type: String },
  },
  featuredImage: String,
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['news', 'guides', 'reviews', 'updates', 'tips', 'general'],
  },
  tags: [String],
  published: {
    type: Boolean,
    default: false,
  },
  publishedAt: {
    type: Date,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  commentsEnabled: {
    type: Boolean,
    default: true,
  },
  seoTitle: String,
  seoDescription: String,
}, { timestamps: true });

BlogPostSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    const slug = this.title.ar || this.title.en || 'post';
    this.slug = slug
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  if (this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('BlogPost', BlogPostSchema);