const mongoose = require('mongoose');
const config = require('../config/config');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Product = require('../models/Product');

const seedData = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Seller.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@ctgpro.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
    });
    console.log('Admin created');

    const sellers = await Seller.create([
      {
        name: 'GamingStore DZ',
        email: 'gamingstore@ctgpro.com',
        avatar: 'G',
        bio: 'متخصص في شحن الألعاب منذ 3 سنوات',
        rating: 4.9,
        totalSales: 1250,
        status: 'active',
        verificationStatus: 'verified',
      },
      {
        name: 'CardShop Pro',
        email: 'cardshop@ctgpro.com',
        avatar: 'C',
        bio: 'أفضل أسعار بطاقات الهدايا',
        rating: 4.8,
        totalSales: 890,
        status: 'active',
        verificationStatus: 'verified',
      },
      {
        name: 'GameKeys DZ',
        email: 'gamekeys@ctgpro.com',
        avatar: 'K',
        bio: 'مفاتيح ألعاب واشتراكات بأسعار تنافسية',
        rating: 4.7,
        totalSales: 560,
        status: 'active',
        verificationStatus: 'verified',
      },
    ]);
    console.log('Sellers created');

    await User.create([
      { name: 'GamingStore DZ', email: 'gamingstore@ctgpro.com', password: 'seller123', role: 'seller', sellerId: sellers[0]._id, isVerified: true },
      { name: 'CardShop Pro', email: 'cardshop@ctgpro.com', password: 'seller123', role: 'seller', sellerId: sellers[1]._id, isVerified: true },
      { name: 'GameKeys DZ', email: 'gamekeys@ctgpro.com', password: 'seller123', role: 'seller', sellerId: sellers[2]._id, isVerified: true },
    ]);
    console.log('Seller users created');

    await User.create({
      name: 'مستخدم تجريبي',
      email: 'demo@ctgpro.com',
      password: '123456',
      role: 'user',
      isVerified: true,
    });
    console.log('Demo user created');

    const products = [
      {
        name: { ar: 'شحن ماسنجر ليجندز 💎 500 + 50 هدية', en: 'Mobile Legends 500 Diamonds +50 Bonus', fr: 'Mobile Legends 500 Diamants +50' },
        category: 'topup',
        productType: 'game_topup',
        game: 'mlbb',
        gameServers: ['asia', 'europe', 'america'],
        gameAmounts: [50, 100, 250, 500, 1000, 2000, 5000],
        gamePricePerUnit: 0.018,
        price: 8.99,
        oldPrice: 13.99,
        stock: 150,
        platform: 'Mobile Legends',
        deliveryTime: 'فوري',
        badge: 'hot',
        tag: { ar: 'الأكثر مبيعاً', en: 'Best Seller', fr: 'Meilleure vente' },
        rating: 4.8,
        reviewsCount: 1243,
        sellerId: sellers[0]._id,
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=300',
      },
      {
        name: { ar: 'بطاقة ستيم 💳 50 دولار', en: 'Steam Wallet $50', fr: 'Carte Steam 50$' },
        category: 'giftcards',
        productType: 'digital',
        price: 47.99,
        oldPrice: 50,
        stock: 500,
        platform: 'Steam',
        deliveryTime: 'فوري',
        tag: { ar: 'وفر 4%', en: 'Save 4%', fr: 'Économisez 4%' },
        rating: 4.9,
        reviewsCount: 892,
        sellerId: sellers[1]._id,
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1580234811497-9df7fd2f357e?w=300',
      },
      {
        name: { ar: 'شحن PUBG Mobile 1050 UC', en: 'PUBG Mobile 1050 UC', fr: 'PUBG Mobile 1050 UC' },
        category: 'topup',
        productType: 'game_topup',
        game: 'pubg',
        gameServers: ['asia', 'europe', 'america', 'middle_east'],
        gameAmounts: [60, 300, 600, 1500, 3000, 6000, 10000],
        gamePricePerUnit: 0.009,
        price: 6.99,
        oldPrice: 9.99,
        stock: 300,
        platform: 'PUBG',
        deliveryTime: 'فوري',
        badge: 'sale',
        tag: { ar: 'خصم 30%', en: '30% Off', fr: '-30%' },
        rating: 4.7,
        reviewsCount: 2341,
        sellerId: sellers[0]._id,
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300',
      },
      {
        name: { ar: 'بلايستيشن ستور 70$', en: 'PlayStation Store $70', fr: 'PlayStation Store 70$' },
        category: 'giftcards',
        productType: 'digital',
        price: 66.99,
        oldPrice: 70,
        stock: 200,
        platform: 'PlayStation',
        deliveryTime: 'فوري',
        tag: { ar: 'شحن فوري', en: 'Instant', fr: 'Instantané' },
        rating: 4.6,
        reviewsCount: 567,
        sellerId: sellers[2]._id,
        isFeatured: false,
        image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300',
      },
      {
        name: { ar: 'فري فاير 🔥 1000 ماسة', en: 'Free Fire 1000 Diamonds', fr: 'Free Fire 1000 Diamants' },
        category: 'topup',
        productType: 'game_topup',
        game: 'freefire',
        gameServers: ['global'],
        gameAmounts: [100, 200, 500, 1000, 2000, 5000, 10000],
        gamePricePerUnit: 0.008,
        price: 3.99,
        oldPrice: 5.49,
        stock: 450,
        platform: 'Free Fire',
        deliveryTime: 'فوري',
        badge: 'hot',
        tag: { ar: 'عرض البرق', en: 'Flash Sale', fr: 'Vente Flash' },
        rating: 4.9,
        reviewsCount: 3156,
        sellerId: sellers[1]._id,
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300',
      },
    ];

    await Product.create(products);
    console.log('Products created');

    for (const seller of sellers) {
      const count = await Product.countDocuments({ sellerId: seller._id });
      seller.totalProducts = count;
      await seller.save();
    }

    console.log('✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();