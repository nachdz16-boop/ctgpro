const mongoose = require('mongoose');

const EndpointSchema = new mongoose.Schema({
  path: { type: String, required: true },
  method: { type: String, required: true },
  description: { type: String, default: '' },
});

const LogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  level: { type: String, default: 'info' },
  message: { type: String, default: '' },
  details: { type: mongoose.Schema.Types.Mixed },
});

const ApiSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  provider: { type: String, default: 'internal' },
  baseUrl: { type: String, default: '' },
  version: { type: String, default: 'v1' },
  authType: { type: String, default: 'api_key' },
  apiKey: { type: String, required: true },
  secretKey: { type: String, default: '' },
  rateLimit: { type: Number, default: 100 },
  rateLimitPerMinute: { type: Number, default: 60 },
  timeout: { type: Number, default: 30 },
  retryCount: { type: Number, default: 3 },
  isActive: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: false },
  documentation: { type: String, default: '' },
  endpoints: { type: [EndpointSchema], default: [] },
  allowedIPs: { type: [String], default: [] },
  webhookUrl: { type: String, default: '' },
  tier: { type: String, default: 'free' },
  monthlyLimit: { type: Number, default: 1000 },
  costPerRequest: { type: Number, default: 0.001 },
  logs: { type: [LogSchema], default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Api', ApiSchema);
