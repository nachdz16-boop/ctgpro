const express = require('express');
const AiBot = require('../models/AiBot');
const Product = require('../models/Product');
const aiService = require('../services/aiService');
const AiBotConversation = require('../models/AiBotConversation');

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const bot = await AiBot.findOne({ isActive: true, status: 'online' }).sort({ createdAt: -1 });
    if (!bot) return res.status(404).json({ success: false, message: 'البوت غير متاح حالياً' });

    const prompt = (req.body.prompt || '').trim();
    if (!prompt) return res.status(400).json({ success: false, message: 'الرجاء إدخال نص الاستعلام' });

    const sessionId = req.body.sessionId || `session-${Date.now()}`;
    const conversation = await AiBotConversation.findOneAndUpdate(
      { sessionId, botId: bot._id },
      {
        $setOnInsert: { sessionId, botId: bot._id, userId: null },
        $push: { messages: { role: 'user', content: prompt, createdAt: new Date() } },
        $set: { lastActivityAt: new Date() },
      },
      { new: true, upsert: true }
    );

    const products = await Product.find({ isActive: true }).limit(8).lean();
    const faqContext = [
      'ما هي مدة التوصيل؟ التوصيل يكون فورياً أو في غضون ساعات قليلة حسب النوع.',
      'كيف أسترجع الطلب؟ يمكن التواصل مع الدعم خلال 24 ساعة من الطلب.',
      'هل يوجد شحن دولي؟ نعم، المتجر يدعم الطلبات الدولية.',
      'ما هي طرق الدفع؟ المتجر يدعم الدفع الإلكتروني والمحافظ والبطاقات.',
    ];
    const contextPrompt = `أنت مساعد ذكي لمتجر إلكتروني. استخدم هذه المعلومات عند الإجابة:\n- المنتجات المتاحة: ${products.map((p) => `${p.name?.ar || p.name?.en || p.name} (${p.price}دج)`).join(', ')}\n- أسئلة شائعة: ${faqContext.join(' | ')}`;

    const apiKey = bot.apiKey?.trim() || process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, message: 'مفتاح API غير متوفر لهذا البوت' });

    const text = await aiService.callAiProvider({ bot, prompt: `${contextPrompt}\n\nالسؤال: ${prompt}`, apiKey });
    bot.totalRequests = (bot.totalRequests || 0) + 1;
    await bot.save();

    conversation.messages.push({ role: 'assistant', content: text, createdAt: new Date() });
    conversation.lastActivityAt = new Date();
    await conversation.save();

    res.json({ success: true, message: text, sessionId });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'حدث خطأ أثناء الاتصال بالبوت' });
  }
});

module.exports = router;
