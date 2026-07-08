const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
    fr: { type: String },
  },
  message: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
    fr: { type: String },
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'promo'],
    default: 'info',
  },
  icon: String,
  active: {
    type: Boolean,
    default: true,
  },
  dismissible: {
    type: Boolean,
    default: true,
  },
  startDate: Date,
  endDate: Date,
  priority: {
    type: Number,
    default: 0,
  },
  linkUrl: String,
  linkText: {
    ar: String,
    en: String,
    fr: String,
  },
  targetAudience: {
    type: String,
    enum: ['all', 'users', 'sellers', 'admins'],
    default: 'all',
  },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);