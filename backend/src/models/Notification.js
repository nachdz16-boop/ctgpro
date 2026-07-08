const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    ar: String,
    en: String,
    fr: String,
  },
  message: {
    ar: String,
    en: String,
    fr: String,
  },
  type: {
    type: String,
    enum: ['system', 'order', 'support', 'chatbot', 'promo', 'update', 'payment', 'success', 'warning', 'error', 'info'],
    default: 'system',
  },
  icon: String,
  link: String,
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
}, { timestamps: true });

NotificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Notification', NotificationSchema);