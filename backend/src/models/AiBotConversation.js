const mongoose = require('mongoose');

const AiBotConversationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  botId: { type: mongoose.Schema.Types.ObjectId, ref: 'AiBot', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  lastActivityAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('AiBotConversation', AiBotConversationSchema);
