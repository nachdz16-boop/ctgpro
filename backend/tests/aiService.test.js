const test = require('node:test');
const assert = require('node:assert/strict');
const { buildBusinessIntelligence, generateImageFromPrompt, resolveProductImage, saveGeneratedImage, saveUploadedImageBuffer } = require('../src/services/aiService');

test('buildBusinessIntelligence produces actionable commerce guidance', () => {
  const result = buildBusinessIntelligence({
    prompt: 'كيف أرفع المبيعات الأسبوعية؟',
    businessContext: {
      productsCount: 12,
      lowStockProducts: [{ name: { ar: 'بطاقة شحن' } }],
      pendingOrders: 3,
      completedOrders: 10,
      usersCount: 120,
      sellersCount: 6,
      revenue: 6400,
    },
  });

  assert.match(result, /مخزون/i);
  assert.match(result, /فرصة/i);
  assert.match(result, /تسويق/i);
});

test('generateImageFromPrompt returns a usable image asset', async () => {
  const image = await generateImageFromPrompt({ prompt: 'منتج رقمي عصري' });

  assert.ok(image);
  assert.match(image, /^(data:image\/|https?:\/\/)/i);
});

test('resolveProductImage uses an explicit generated image URL', async () => {
  const image = await resolveProductImage({ imageUrl: 'https://example.com/generated.png', imageQuery: 'test' });

  assert.equal(image, 'https://example.com/generated.png');
});

test('saveGeneratedImage returns a local upload URL', async () => {
  const savedUrl = await saveGeneratedImage({ imageUrl: 'https://example.com/generated.png', filename: 'test-generated.png' });

  assert.match(savedUrl, /\/uploads\//i);
});

test('saveUploadedImageBuffer stores local upload URLs for manual uploads', async () => {
  const savedUrl = await saveUploadedImageBuffer({ buffer: Buffer.from('fake-image'), filename: 'manual-upload.png' });

  assert.match(savedUrl, /\/uploads\//i);
});
