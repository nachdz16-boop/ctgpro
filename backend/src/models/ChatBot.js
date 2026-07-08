const mongoose = require('mongoose');

const ChatBotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  greeting: { type: String, default: 'مرحباً! كيف يمكنني مساعدتك اليوم؟' },
  fallbackMessage: { type: String, default: 'عذراً، لم أفهم سؤالك. هل يمكنك إعادة صياغته؟' },
  isActive: { type: Boolean, default: true },
  autoReply: { type: Boolean, default: true },
  language: { type: String, default: 'ar' },
  responseTime: { type: Number, default: 5 },
  maxMessagesPerSession: { type: Number, default: 50 },
  allowedChannels: { type: [String], default: ['website', 'mobile', 'whatsapp'] },
  categories: { type: [String], default: ['general', 'support', 'sales'] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('ChatBot', ChatBotSchema);
