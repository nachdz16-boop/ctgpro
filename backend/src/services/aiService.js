const https = require('https');
const fs = require('fs');
const path = require('path');

const buildBusinessIntelligence = ({ prompt, businessContext = {} }) => {
  const productsCount = businessContext.productsCount || 0;
  const lowStockProducts = Array.isArray(businessContext.lowStockProducts) ? businessContext.lowStockProducts : [];
  const pendingOrders = businessContext.pendingOrders || 0;
  const completedOrders = businessContext.completedOrders || 0;
  const usersCount = businessContext.usersCount || 0;
  const sellersCount = businessContext.sellersCount || 0;
  const revenue = businessContext.revenue || 0;

  const recommendations = [];
  if (lowStockProducts.length) {
    recommendations.push(`إعادة تعبئة المخزون ل${lowStockProducts.length} منتج/منتجات ذات حركة مرتفعة.`);
  }
  if (pendingOrders > completedOrders) {
    recommendations.push('تسريع معالجة الطلبات المعلقة لخفض التوقف في التوصيل.');
  }
  if (usersCount > 100) {
    recommendations.push('استهداف حملات تسويق مخصصة لشرائح المستخدمين النشطين.');
  }
  if (sellersCount > 0 && revenue > 0) {
    recommendations.push('استغلال فرصة تجارية عبر شراكات مع البائعين وزيادة عروض المبيعات.');
  }
  if (!recommendations.length) {
    recommendations.push('تحسين تجربة العملاء عبر عروض ترويجية قصيرة المدى وملفات منتجات أقوى.');
  }

  return `خطة داخلية للبوت: ${prompt}\n- عدد المنتجات: ${productsCount}\n- الطلبات المعلقة: ${pendingOrders}\n- الطلبات المكتملة: ${completedOrders}\n- عدد المستخدمين: ${usersCount}\n- عدد البائعين: ${sellersCount}\n- الإيرادات: ${revenue}دج\n- الإجراء المقترح: ${recommendations.join(' ')}\n- اتجاه ذكي: التركيز على المخزون، التسويق، واقتناص الفرص التجارية.`;
};

const buildFallbackResponse = ({ prompt, businessContext = {} }) => {
  const intelligence = buildBusinessIntelligence({ prompt, businessContext });
  const marketSignals = [
    'استخدم العروض المؤقتة لرفع التحويلات.',
    'ركز على الرسائل التسويقية الموجهة لشرائح المستخدمين الأكثر نشاطًا.',
    'استغل فرص التوسعة عبر شراكات البائعين والتخفيضات الموسمية.',
  ];

  return `${intelligence}\n- إشارات سوقية: ${marketSignals.join(' ')}\n- وضع التشغيل: محرك داخلي محلي بدون اعتماد على API خارجي.`;
};

const sendGetRequest = (requestUrl, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(requestUrl);
    const options = {
      hostname: url.hostname,
      path: `${url.pathname}${url.search}`,
      method: 'GET',
      headers,
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch (err) {
          reject(new Error('تعذر تحليل استجابة البحث عن صورة'));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

const lookupProductImage = async ({ query = 'product' }) => {
  const normalized = (query || '').trim() || 'product';
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (unsplashKey) {
    try {
      const data = await sendGetRequest(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(normalized)}&per_page=1`, {
        Authorization: `Client-ID ${unsplashKey}`,
      });
      const imageUrl = data?.results?.[0]?.urls?.regular;
      if (imageUrl) return imageUrl;
    } catch (error) {
      // fall back gracefully
    }
  }

  const pexelsKey = process.env.PEXELS_API_KEY?.trim();
  if (pexelsKey) {
    try {
      const data = await sendGetRequest(`https://api.pexels.com/v1/search?query=${encodeURIComponent(normalized)}&per_page=1`, {
        Authorization: pexelsKey,
      });
      const imageUrl = data?.photos?.[0]?.src?.large;
      if (imageUrl) return imageUrl;
    } catch (error) {
      // fall back gracefully
    }
  }

  return `https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80`;
};

const generateImageFromPrompt = async ({ prompt = 'product' }) => {
  const normalizedPrompt = (prompt || '').trim() || 'product';
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (apiKey) {
    try {
      const payload = {
        model: 'gpt-image-1',
        prompt: normalizedPrompt,
        size: '1024x1024',
      };

      const response = await sendPostRequest('https://api.openai.com/v1/images/generations', apiKey, payload);
      const imageUrl = response?.data?.[0]?.url;
      if (imageUrl) return imageUrl;
    } catch (error) {
      // fall back gracefully
    }
  }

  return `https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80`;
};

const resolveProductImage = async ({ imageUrl, imageQuery, name }) => {
  const explicitImage = (imageUrl || '').trim();
  if (explicitImage) return explicitImage;

  const query = (imageQuery || name || '').trim();
  return lookupProductImage({ query });
};

const saveGeneratedImage = async ({ imageUrl, filename }) => {
  const uploadDir = path.join(__dirname, '../../uploads');
  const destinationDir = path.resolve(uploadDir);
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
  }

  const safeName = (filename || 'generated-image.png').toString().replace(/[^a-zA-Z0-9._-]/g, '-');
  const targetPath = path.join(destinationDir, `${Date.now()}-${safeName}`);

  if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) {
    return `/uploads/${path.basename(targetPath)}`;
  }

  try {
    const buffer = await downloadImageBuffer(imageUrl);
    fs.writeFileSync(targetPath, buffer);
    return `/uploads/${path.basename(targetPath)}`;
  } catch (error) {
    return `/uploads/${path.basename(targetPath)}`;
  }
};

const saveUploadedImageBuffer = async ({ buffer, filename }) => {
  const uploadDir = path.join(__dirname, '../../uploads');
  const destinationDir = path.resolve(uploadDir);
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
  }

  const safeName = (filename || 'uploaded-image.png').toString().replace(/[^a-zA-Z0-9._-]/g, '-');
  const targetPath = path.join(destinationDir, `${Date.now()}-${safeName}`);

  if (!buffer || !Buffer.isBuffer(buffer)) {
    return `/uploads/${path.basename(targetPath)}`;
  }

  fs.writeFileSync(targetPath, buffer);
  return `/uploads/${path.basename(targetPath)}`;
};

const downloadImageBuffer = (requestUrl) => {
  return new Promise((resolve, reject) => {
    https.get(requestUrl, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadImageBuffer(res.headers.location));
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`فشل تنزيل الصورة (${res.statusCode})`));
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
};

const parseProductIntent = ({ prompt }) => {
  const normalized = (prompt || '').toLowerCase();
  const nameMatch = prompt.match(/(?:منتج|إضافة|أنشئ|أنشئ منتج|أضف|خلق)(?:\s+منتج)?\s+([\w\s\-]+)/i);
  const defaultName = nameMatch?.[1]?.trim() || 'منتج جديد';

  const category = normalized.includes('بطاقة') || normalized.includes('card') ? 'giftcards' : 'topup';
  const productType = normalized.includes('شحن') || normalized.includes('recharge') ? 'mobile_recharge' : 'digital';
  const priceMatch = prompt.match(/(\d+(?:\.\d+)?)/);
  const price = Number(priceMatch?.[1] || 1000);
  const stock = normalized.includes('مخزون') || normalized.includes('stock') ? 50 : 20;
  const image = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80';

  return {
    name: defaultName,
    category,
    productType,
    price,
    stock,
    image,
    description: `منتج مُقترح من البوت: ${defaultName}`,
  };
};

const buildProductLaunchPlan = ({ product }) => {
  const marketingSuggestions = [
    'أطلق عرضًا مبدئيًا لمدة 72 ساعة.',
    'استخدم قصة المنتج في وصف الصفحة ووسائل التواصل.',
    'شغّل حملة موجهة لعملاء يشترون منتجات مشابهة.',
  ];
  const productionSuggestions = [
    'تحقق من توفر المخزون قبل النشر.',
    'جهّز صورًا احتياطية ونسخة وصف مختصرة.',
    'أضف كلمات مفتاحية مناسبة للبحث داخل الصفحة.',
  ];

  return [
    `إعداد المنتج: ${product.name}`,
    `السعر المقترح: ${product.price}دج`,
    `المخزون المبدئي: ${product.stock}`,
    `الصور: ${product.image}`,
    `اقتراحات تسويق: ${marketingSuggestions.join(' ')}`,
    `اقتراحات إنتاج: ${productionSuggestions.join(' ')}`,
  ].join('\n');
};

const sendPostRequest = (requestUrl, apiKey, body) => {
  return new Promise((resolve, reject) => {
    const url = new URL(requestUrl);
    const data = JSON.stringify(body);

    const options = {
      hostname: url.hostname,
      path: `${url.pathname}${url.search}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        let parsed;
        try {
          parsed = JSON.parse(responseData);
        } catch (err) {
          return reject(new Error('تعذر تحليل استجابة موفر الذكاء الاصطناعي'));
        }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          return resolve(parsed);
        }

        const errorMessage = parsed?.error?.message || parsed?.message || `خطأ من موفر الذكاء الاصطناعي (${res.statusCode})`;
        const error = new Error(errorMessage);
        error.status = res.statusCode;
        error.details = parsed;
        return reject(error);
      });
    });

    req.on('error', (err) => reject(err));
    req.write(data);
    req.end();
  });
};

exports.buildBusinessIntelligence = buildBusinessIntelligence;
exports.buildFallbackResponse = buildFallbackResponse;
exports.lookupProductImage = lookupProductImage;
exports.generateImageFromPrompt = generateImageFromPrompt;
exports.resolveProductImage = resolveProductImage;
exports.saveGeneratedImage = saveGeneratedImage;
exports.saveUploadedImageBuffer = saveUploadedImageBuffer;
exports.parseProductIntent = parseProductIntent;
exports.buildProductLaunchPlan = buildProductLaunchPlan;

exports.callAiProvider = async ({ bot, prompt, apiKey }) => {
  const provider = (bot.provider || 'openai').toLowerCase();
  const model = bot.model || 'gpt-4';
  const temperature = typeof bot.temperature === 'number' ? bot.temperature : 0.7;
  const maxTokens = bot.maxTokens || 2000;
  const systemPrompt = bot.systemPrompt?.trim() || 'أنت مساعد ذكي محترف يساعد في الإجابة بشكل دقيق وموجز.';

  if (provider === 'openai') {
    if (!apiKey) {
      return buildFallbackResponse({ prompt, businessContext: bot.businessContext || {} });
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ];

    const payload = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    const response = await sendPostRequest('https://api.openai.com/v1/chat/completions', apiKey, payload);
    const choice = response?.choices?.[0];
    if (!choice) {
      throw new Error('لم تتلقَّ استجابة صحيحة من OpenAI');
    }

    return choice.message?.content || choice.text || '';
  }

  throw new Error(`المزود ${bot.provider} غير مدعوم حالياً`);
};
