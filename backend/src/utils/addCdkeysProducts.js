const mongoose = require('mongoose');
const config = require('../config/config');
const Product = require('../models/Product');
const Seller = require('../models/Seller');

const cdkeysProducts = [
  {
    key: 'steam-ultimate-2026',
    name: {
      ar: 'Steam Global Key - Ultimate Pack 2026',
      en: 'Steam Global Key - Ultimate Pack 2026',
      fr: 'Steam Global Key - Ultimate Pack 2026',
    },
    description: {
      ar: 'مفتاح Steam عالمي فوري مع دعم كامل للتفعيل.',
      en: 'Instant global Steam key with full activation support.',
      fr: 'Cle Steam globale instantanee avec support d activation complet.',
    },
    price: 19.99,
    oldPrice: 24.99,
    stock: 140,
    platform: 'Steam',
    region: 'Global',
    tag: { ar: 'خصم 20%', en: '20% Off', fr: '-20%' },
    badge: 'sale',
    rating: 4.8,
    reviewsCount: 312,
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
  },
  {
    key: 'ea-fc26-standard',
    name: {
      ar: 'EA FC 26 Standard Key',
      en: 'EA FC 26 Standard Key',
      fr: 'EA FC 26 Standard Key',
    },
    description: {
      ar: 'نسخة قياسية بمفتاح رقمي فوري.',
      en: 'Standard edition with instant digital key.',
      fr: 'Edition standard avec cle numerique instantanee.',
    },
    price: 39.99,
    oldPrice: 49.99,
    stock: 85,
    platform: 'EA App',
    region: 'EU',
    tag: { ar: 'الأكثر طلبا', en: 'Top Demand', fr: 'Top demande' },
    badge: 'hot',
    rating: 4.7,
    reviewsCount: 198,
    image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800',
  },
  {
    key: 'gta-v-premium-key',
    name: {
      ar: 'GTA V Premium Edition Key',
      en: 'GTA V Premium Edition Key',
      fr: 'GTA V Premium Edition Key',
    },
    description: {
      ar: 'مفتاح رقمي رسمي مع تسليم فوري.',
      en: 'Official digital key with instant delivery.',
      fr: 'Cle numerique officielle avec livraison instantanee.',
    },
    price: 14.49,
    oldPrice: 18.99,
    stock: 200,
    platform: 'Rockstar',
    region: 'Global',
    tag: { ar: 'موصى به', en: 'Recommended', fr: 'Recommande' },
    badge: 'new',
    rating: 4.9,
    reviewsCount: 523,
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
  },
  {
    key: 'minecraft-java-bedrock',
    name: {
      ar: 'Minecraft Java and Bedrock Key',
      en: 'Minecraft Java and Bedrock Key',
      fr: 'Minecraft Java and Bedrock Key',
    },
    description: {
      ar: 'مفتاح رسمي للنسختين Java و Bedrock.',
      en: 'Official key for Java and Bedrock editions.',
      fr: 'Cle officielle pour Java et Bedrock.',
    },
    price: 21.99,
    oldPrice: 26.99,
    stock: 130,
    platform: 'Microsoft',
    region: 'Global',
    tag: { ar: 'جديد', en: 'New', fr: 'Nouveau' },
    badge: 'new',
    rating: 4.8,
    reviewsCount: 271,
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
  },
  {
    key: 'cyberpunk-ultimate-key',
    name: {
      ar: 'Cyberpunk 2077 Ultimate Key',
      en: 'Cyberpunk 2077 Ultimate Key',
      fr: 'Cyberpunk 2077 Ultimate Key',
    },
    description: {
      ar: 'نسخة كاملة مع توسعة Phantom Liberty.',
      en: 'Full edition including Phantom Liberty expansion.',
      fr: 'Edition complete avec extension Phantom Liberty.',
    },
    price: 33.5,
    oldPrice: 41.0,
    stock: 76,
    platform: 'GOG',
    region: 'Global',
    tag: { ar: 'عرض خاص', en: 'Special Offer', fr: 'Offre speciale' },
    badge: 'sale',
    rating: 4.6,
    reviewsCount: 154,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
  },
  {
    key: 'rdr2-story-key',
    name: {
      ar: 'Red Dead Redemption 2 Key',
      en: 'Red Dead Redemption 2 Key',
      fr: 'Red Dead Redemption 2 Key',
    },
    description: {
      ar: 'مفتاح Rockstar/Steam مع دعم التفعيل.',
      en: 'Rockstar/Steam key with activation support.',
      fr: 'Cle Rockstar/Steam avec support d activation.',
    },
    price: 27.75,
    oldPrice: 34.5,
    stock: 92,
    platform: 'Rockstar',
    region: 'Global',
    tag: { ar: 'مبيع قوي', en: 'Hot Seller', fr: 'Top vente' },
    badge: 'hot',
    rating: 4.9,
    reviewsCount: 403,
    image: 'https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42?w=800',
  },
  {
    key: 'helldivers2-key',
    name: {
      ar: 'Helldivers 2 Digital Key',
      en: 'Helldivers 2 Digital Key',
      fr: 'Helldivers 2 Digital Key',
    },
    description: {
      ar: 'مفتاح فوري للعبة Helldivers 2.',
      en: 'Instant key for Helldivers 2.',
      fr: 'Cle instantanee pour Helldivers 2.',
    },
    price: 28.99,
    oldPrice: 35.0,
    stock: 64,
    platform: 'Steam',
    region: 'Global',
    tag: { ar: 'خصم جديد', en: 'Fresh Deal', fr: 'Nouvelle promo' },
    badge: 'sale',
    rating: 4.5,
    reviewsCount: 87,
    image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800',
  },
  {
    key: 'valorant-points-bundle-key',
    name: {
      ar: 'Valorant Points Bundle Key',
      en: 'Valorant Points Bundle Key',
      fr: 'Valorant Points Bundle Key',
    },
    description: {
      ar: 'حزمة نقاط Valorant بكود رقمي سريع.',
      en: 'Valorant points bundle via instant digital code.',
      fr: 'Pack de points Valorant via code numerique instantane.',
    },
    price: 12.99,
    oldPrice: 15.99,
    stock: 220,
    platform: 'Riot',
    region: 'MENA',
    tag: { ar: 'فوري', en: 'Instant', fr: 'Instantane' },
    badge: 'new',
    rating: 4.7,
    reviewsCount: 265,
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
  },
];

async function addCdkeysProducts() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    const sellers = await Seller.find({ status: 'active' }).limit(3);
    if (!sellers.length) {
      throw new Error('No active sellers found to assign products.');
    }

    let inserted = 0;
    let updated = 0;

    for (let i = 0; i < cdkeysProducts.length; i += 1) {
      const seller = sellers[i % sellers.length];
      const p = cdkeysProducts[i];

      const doc = {
        name: p.name,
        description: p.description,
        category: 'cdkeys',
        productType: 'digital',
        price: p.price,
        oldPrice: p.oldPrice,
        stock: p.stock,
        image: p.image,
        platform: p.platform,
        region: p.region,
        deliveryTime: 'فوري',
        badge: p.badge,
        tag: p.tag,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        isActive: true,
        isFeatured: i < 3,
        sellerId: seller._id,
        metaTitle: p.name.en,
        metaDescription: p.description.en,
        seoKeywords: `cdkey,${p.platform},digital key,${p.key}`,
      };

      const existing = await Product.findOne({
        category: 'cdkeys',
        'name.en': p.name.en,
      });

      if (existing) {
        await Product.updateOne({ _id: existing._id }, { $set: doc });
        updated += 1;
      } else {
        await Product.create(doc);
        inserted += 1;
      }
    }

    console.log(`Done. Inserted: ${inserted}, Updated: ${updated}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Failed to add cdkeys products:', error.message);
    process.exit(1);
  }
}

addCdkeysProducts();
