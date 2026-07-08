const mongoose = require('mongoose');

const AiBotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  model: { type: String, default: 'gpt-4' },
  provider: { type: String, default: 'openai' },
  apiKey: { type: String, default: '' },
  temperature: { type: Number, default: 0.7 },
  maxTokens: { type: Number, default: 2000 },
  systemPrompt: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['online', 'offline'], default: 'offline' },
  allowedFor: { type: [String], default: ['admin', 'seller', 'user'] },
  dailyLimit: { type: Number, default: 100 },
  monthlyLimit: { type: Number, default: 3000 },
  costPerRequest: { type: Number, default: 0.01 },
  totalRequests: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

AiBotSchema.statics.seedDefaultAiBot = async function () {
  const existing = await this.findOne({ name: 'CTGPRO Bot' });
  if (existing) return existing;

  return this.create({
    name: 'CTGPRO Bot',
    description: 'بوت افتراضي مدمج داخل لوحة الإدارة لمساعدة الإدارة على الرد على الأسئلة المتعلقة بالمتجر والطلبات والمنتجات.',
    model: 'gpt-4',
    provider: 'openai',
    isActive: true,
    status: 'online',
    systemPrompt: 'أنت مساعد CTGPRO الذكي داخل لوحة الإدارة. ساعد الإدارة في الإجابة عن الأسئلة المتعلقة بالطلبات، المنتجات، المخزون، الزكاة، والتواصل مع العملاء. استخدم معلومات المتجر الحالية عند الإمكان.',
    dailyLimit: 500,
    monthlyLimit: 15000,
    costPerRequest: 0.01,
  });
};

module.exports = mongoose.model('AiBot', AiBotSchema);
