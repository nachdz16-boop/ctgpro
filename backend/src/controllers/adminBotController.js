const AiBot = require('../models/AiBot');
const ChatBot = require('../models/ChatBot');
const AiBotConversation = require('../models/AiBotConversation');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Seller = require('../models/Seller');
const aiService = require('../services/aiService');
const { emitGlobal } = require('../services/socketService');

exports.uploadAiImage = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ success: false, message: 'لم يتم اختيار صورة صالحة' });
    }

    const imageUrl = await aiService.saveUploadedImageBuffer({
      buffer: req.file.buffer,
      filename: req.file.originalname,
    });
    res.json({ success: true, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'حدث خطأ أثناء رفع الصورة' });
  }
};

exports.getAiBots = async (req, res) => {
  try {
    const bots = await AiBot.find().sort({ createdAt: -1 });
    res.json({ success: true, bots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAiBot = async (req, res) => {
  try {
    const bot = await AiBot.findById(req.params.id);
    if (!bot) return res.status(404).json({ success: false, message: 'بوت AI غير موجود' });
    res.json({ success: true, bot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAiBot = async (req, res) => {
  try {
    const bot = await AiBot.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, bot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAiBot = async (req, res) => {
  try {
    const bot = await AiBot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bot) return res.status(404).json({ success: false, message: 'بوت AI غير موجود' });
    res.json({ success: true, bot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAiBot = async (req, res) => {
  try {
    const bot = await AiBot.findByIdAndDelete(req.params.id);
    if (!bot) return res.status(404).json({ success: false, message: 'بوت AI غير موجود' });
    res.json({ success: true, message: 'تم حذف بوت AI بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleAiBotStatus = async (req, res) => {
  try {
    const bot = await AiBot.findById(req.params.id);
    if (!bot) return res.status(404).json({ success: false, message: 'بوت AI غير موجود' });
    bot.isActive = !bot.isActive;
    await bot.save();
    res.json({ success: true, bot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAiBotAvailability = async (req, res) => {
  try {
    const bot = await AiBot.findById(req.params.id);
    if (!bot) return res.status(404).json({ success: false, message: 'بوت AI غير موجود' });

    const status = (req.body.status || '').toLowerCase();
    if (!['online', 'offline'].includes(status)) {
      return res.status(400).json({ success: false, message: 'الحالة يجب أن تكون online أو offline' });
    }

    bot.status = status;
    bot.isActive = status === 'online' ? bot.isActive : false;
    await bot.save();
    res.json({ success: true, bot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.chatWithActiveAiBot = async (req, res) => {
  try {
    const bot = await AiBot.findOne({ isActive: true, status: 'online' }).sort({ createdAt: -1 });
    if (!bot) {
      const seededBot = await AiBot.seedDefaultAiBot();
      req.params.id = seededBot._id.toString();
      return exports.chatWithAiBot(req, res);
    }

    req.params.id = bot._id.toString();
    return exports.chatWithAiBot(req, res);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'حدث خطأ أثناء إعداد البوت النشط' });
  }
};

exports.generateAiImage = async (req, res) => {
  try {
    const prompt = (req.body.prompt || '').trim();
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'الرجاء إدخال وصف الصورة' });
    }

    const imageUrl = await aiService.generateImageFromPrompt({ prompt });
    res.json({ success: true, imageUrl, prompt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'حدث خطأ أثناء توليد الصورة' });
  }
};

exports.createAiProductFromPrompt = async (req, res) => {
  try {
    const name = (req.body.name || '').trim() || 'منتج جديد';
    const description = (req.body.description || '').trim() || `منتج مُضاف عبر البوت: ${name}`;
    const price = Number(req.body.price || 1000);
    const stock = Number(req.body.stock || 20);
    const category = req.body.category || 'topup';
    const productType = req.body.productType || 'digital';
    const imageQuery = (req.body.imageQuery || name).trim();
    const image = await aiService.resolveProductImage({
      imageUrl: req.body.imageUrl,
      imageQuery,
      name,
    });
    const persistedImage = await aiService.saveGeneratedImage({
      imageUrl: image,
      filename: `${name}.png`,
    });

    let sellerId = req.body.sellerId || req.user?.sellerId;
    if (!sellerId) {
      const fallbackSeller = await Seller.findOne({ status: 'active' }).lean();
      sellerId = fallbackSeller?._id;
    }

    if (!sellerId) {
      return res.status(400).json({ success: false, message: 'لا يوجد بائع نشط جاهز لإضافة المنتج' });
    }

    const created = await Product.create({
      name: { ar: name, en: name, fr: name },
      description: { ar: description, en: description, fr: description },
      category,
      productType,
      price,
      stock,
      image: persistedImage,
      sellerId,
      isActive: true,
    });

    await Seller.findByIdAndUpdate(sellerId, { $inc: { totalProducts: 1 } });
    emitGlobal('product_created', { product: created });

    const launchPlan = aiService.buildProductLaunchPlan({ product: { name, price, stock, image } });
    res.json({ success: true, product: created, message: `تم إضافة المنتج بنجاح\n${launchPlan}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'حدث خطأ أثناء إضافة المنتج' });
  }
};

exports.chatWithAiBot = async (req, res) => {
  try {
    const bot = await AiBot.findById(req.params.id);
    if (!bot) return res.status(404).json({ success: false, message: 'بوت AI غير موجود' });
    if (!bot.isActive) return res.status(400).json({ success: false, message: 'البوت غير مفعل حالياً' });
    if (bot.status !== 'online') return res.status(400).json({ success: false, message: 'البوت غير متصل حالياً' });

    const prompt = (req.body.prompt || '').trim();
    if (!prompt) return res.status(400).json({ success: false, message: 'الرجاء إدخال نص الاستعلام' });

    const products = await Product.find({ isActive: true }).limit(8).lean();
    const lowStockProducts = await Product.find({ isActive: true, stock: { $lte: 3 } }).limit(5).lean();
    const pendingOrders = await Order.countDocuments({ status: { $in: ['pending', 'processing'] } });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const usersCount = await User.countDocuments();
    const sellersCount = await Seller.countDocuments();
    const revenue = await Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]);
    const faqContext = [
      'ما هي مدة التوصيل؟ التوصيل يكون فورياً أو في غضون ساعات قليلة حسب النوع.',
      'كيف أسترجع الطلب؟ يمكن التواصل مع الدعم خلال 24 ساعة من الطلب.',
      'هل يوجد شحن دولي؟ نعم، المتجر يدعم الطلبات الدولية.',
      'ما هي طرق الدفع؟ المتجر يدعم الدفع الإلكتروني والمحافظ والبطاقات.',
    ];

    const businessContext = {
      productsCount: products.length,
      lowStockProducts,
      pendingOrders,
      completedOrders,
      usersCount,
      sellersCount,
      revenue: revenue[0]?.total || 0,
    };

    const intelligence = aiService.buildBusinessIntelligence({ prompt, businessContext });
    const contextPrompt = `أنت مساعد ذكي لمتجر إلكتروني ووكيل تسويق داخلي. استخدم هذه المعلومات عند الإجابة:\n- المنتجات المتاحة: ${products.map((p) => `${p.name?.ar || p.name?.en || p.name} (${p.price}دج)`).join(', ')}\n- أسئلة شائعة: ${faqContext.join(' | ')}\n- تحليل داخلي: ${intelligence}`;

    const apiKey = bot.apiKey?.trim() || process.env.OPENAI_API_KEY;
    const text = await aiService.callAiProvider({ bot, prompt: `${contextPrompt}\n\nالسؤال: ${prompt}`, apiKey });
    bot.totalRequests = (bot.totalRequests || 0) + 1;
    await bot.save();

    const productIntent = prompt.toLowerCase().includes('منتج') || prompt.toLowerCase().includes('أضف') || prompt.toLowerCase().includes('أنشئ')
      ? aiService.parseProductIntent({ prompt })
      : null;

    if (productIntent) {
      const seller = await Seller.findOne({ status: 'active' }).lean();
      if (seller) {
        const created = await Product.create({
          name: { ar: productIntent.name, en: productIntent.name, fr: productIntent.name },
          description: { ar: productIntent.description, en: productIntent.description, fr: productIntent.description },
          category: productIntent.category,
          productType: productIntent.productType,
          price: productIntent.price,
          stock: productIntent.stock,
          image: productIntent.image,
          sellerId: seller._id,
          isActive: true,
        });
        await Seller.findByIdAndUpdate(seller._id, { $inc: { totalProducts: 1 } });
        emitGlobal('product_created', { product: created });
        const launchPlan = aiService.buildProductLaunchPlan({ product: { ...productIntent, id: created._id.toString() } });
        return res.json({ success: true, message: `${text}\n\nإدراج تلقائي للمنتج:\n${launchPlan}` , product: created });
      }
    }

    res.json({ success: true, message: text });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي' });
  }
};

exports.createAiBotConversation = async (req, res) => {
  try {
    const bot = await AiBot.findById(req.params.id);
    if (!bot) return res.status(404).json({ success: false, message: 'بوت AI غير موجود' });
    if (!bot.isActive || bot.status !== 'online') return res.status(400).json({ success: false, message: 'البوت غير متاح حالياً' });

    const sessionId = req.body.sessionId || `session-${Date.now()}`;
    const userId = req.user?._id || null;
    const prompt = (req.body.prompt || '').trim();
    if (!prompt) return res.status(400).json({ success: false, message: 'الرجاء إدخال نص الاستعلام' });

    const conversation = await AiBotConversation.findOneAndUpdate(
      { sessionId, botId: bot._id },
      {
        $setOnInsert: { sessionId, botId: bot._id, userId },
        $push: { messages: { role: 'user', content: prompt, createdAt: new Date() } },
        $set: { lastActivityAt: new Date() },
      },
      { new: true, upsert: true }
    );

    const products = await Product.find({ isActive: true }).limit(8).lean();
    const lowStockProducts = await Product.find({ isActive: true, stock: { $lte: 3 } }).limit(5).lean();
    const pendingOrders = await Order.countDocuments({ status: { $in: ['pending', 'processing'] } });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const usersCount = await User.countDocuments();
    const sellersCount = await Seller.countDocuments();
    const revenue = await Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]);
    const faqContext = [
      'ما هي مدة التوصيل؟ التوصيل يكون فورياً أو في غضون ساعات قليلة حسب النوع.',
      'كيف أسترجع الطلب؟ يمكن التواصل مع الدعم خلال 24 ساعة من الطلب.',
      'هل يوجد شحن دولي؟ نعم، المتجر يدعم الطلبات الدولية.',
      'ما هي طرق الدفع؟ المتجر يدعم الدفع الإلكتروني والمحافظ والبطاقات.',
    ];
    const businessContext = {
      productsCount: products.length,
      lowStockProducts,
      pendingOrders,
      completedOrders,
      usersCount,
      sellersCount,
      revenue: revenue[0]?.total || 0,
    };
    const intelligence = aiService.buildBusinessIntelligence({ prompt, businessContext });
    const contextPrompt = `أنت مساعد ذكي لمتجر إلكتروني ووكيل تسويق داخلي. استخدم هذه المعلومات عند الإجابة:\n- المنتجات المتاحة: ${products.map((p) => `${p.name?.ar || p.name?.en || p.name} (${p.price}دج)`).join(', ')}\n- أسئلة شائعة: ${faqContext.join(' | ')}\n- تحليل داخلي: ${intelligence}`;

    const apiKey = bot.apiKey?.trim() || process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, message: 'مفتاح API غير متوفر لهذا البوت' });

    const text = await aiService.callAiProvider({ bot, prompt: `${contextPrompt}\n\nالسؤال: ${prompt}`, apiKey });
    bot.totalRequests = (bot.totalRequests || 0) + 1;
    await bot.save();

    conversation.messages.push({ role: 'assistant', content: text, createdAt: new Date() });
    conversation.lastActivityAt = new Date();
    await conversation.save();

    res.json({ success: true, message: text, sessionId, conversation });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي' });
  }
};

exports.getAiBotConversations = async (req, res) => {
  try {
    const conversations = await AiBotConversation.find({ botId: req.params.id }).sort({ lastActivityAt: -1 }).limit(20);
    res.json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getChatBots = async (req, res) => {
  try {
    const bots = await ChatBot.find().sort({ createdAt: -1 });
    res.json({ success: true, bots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getChatBot = async (req, res) => {
  try {
    const bot = await ChatBot.findById(req.params.id);
    if (!bot) return res.status(404).json({ success: false, message: 'بوت المحادثة غير موجود' });
    res.json({ success: true, bot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getChatBotConversations = async (req, res) => {
  try {
    const conversations = [];
    res.json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createChatBot = async (req, res) => {
  try {
    const bot = await ChatBot.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, bot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateChatBot = async (req, res) => {
  try {
    const bot = await ChatBot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bot) return res.status(404).json({ success: false, message: 'بوت المحادثة غير موجود' });
    res.json({ success: true, bot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteChatBot = async (req, res) => {
  try {
    const bot = await ChatBot.findByIdAndDelete(req.params.id);
    if (!bot) return res.status(404).json({ success: false, message: 'بوت المحادثة غير موجود' });
    res.json({ success: true, message: 'تم حذف بوت المحادثة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleChatBotStatus = async (req, res) => {
  try {
    const bot = await ChatBot.findById(req.params.id);
    if (!bot) return res.status(404).json({ success: false, message: 'بوت المحادثة غير موجود' });
    bot.isActive = !bot.isActive;
    await bot.save();
    res.json({ success: true, bot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
