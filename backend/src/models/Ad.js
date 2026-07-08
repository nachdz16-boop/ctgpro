const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, default: 'banner' },
  platform: { type: String, default: 'website' },
  position: { type: String, default: 'top' },
  imageUrl: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  linkUrl: { type: String, default: '' },
  targetUrl: { type: String, default: '' },
  budget: { type: Number, default: 100 },
  dailyBudget: { type: Number, default: 20 },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  targetAudience: {
    ageRange: { type: [Number], default: [18, 65] },
    locations: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    devices: { type: [String], default: ['all'] }
  },
  isActive: { type: Boolean, default: true },
  status: { type: String, default: 'pending' },
  priority: { type: String, default: 'normal' },
  views: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  spent: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Ad', AdSchema);
