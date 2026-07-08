const mongoose = require('mongoose');

const AdminActivityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'login', 'logout', 'approve', 'reject', 'ban', 'unban'],
  },
  resource: {
    type: String,
    enum: ['user', 'seller', 'product', 'order', 'page', 'promo_code', 'gift_card', 'announcement', 'settings', 'notification', 'profile', 'api'],
  },
  resourceId: String,
  details: {
    type: mongoose.Schema.Types.Mixed,
  },
  ipAddress: String,
  userAgent: String,
}, { timestamps: true });

module.exports = mongoose.model('AdminActivityLog', AdminActivityLogSchema);