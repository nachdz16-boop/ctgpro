const Product = require('../models/Product');
const Seller = require('../models/Seller');
const ProductCode = require('../models/ProductCode');
const { emitGlobal } = require('../services/socketService');

// ==================== PRODUCT CRUD ====================

exports.getProducts = async (req, res) => {
  try {
    console.log('📥 getProducts called with query:', req.query);
    
    const {
      category, search, minPrice, maxPrice, platform, rating, sort,
      page = 1, limit = 12, isFeatured, isFlashSale, sellerId, productType
    } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;
    if (platform) query.platform = platform;
    if (productType) query.productType = productType;
    if (isFeatured === 'true') query.isFeatured = true;
    if (isFlashSale === 'true') query.isFlashSale = true;
    if (sellerId) query.sellerId = sellerId;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (rating) query.rating = { $gte: Number(rating) };

    if (search && search.trim().length > 0) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { 'name.ar': searchRegex },
        { 'name.en': searchRegex },
        { 'name.fr': searchRegex },
      ];
    }

    let sortOptions = {};
    switch (sort) {
      case 'price_asc': sortOptions = { price: 1 }; break;
      case 'price_desc': sortOptions = { price: -1 }; break;
      case 'rating': sortOptions = { rating: -1 }; break;
      case 'popular': sortOptions = { purchases: -1 }; break;
      default: sortOptions = { createdAt: -1 };
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    console.log('📊 Query:', JSON.stringify(query, null, 2));
    console.log('📊 Sort:', sortOptions);
    console.log('📊 Skip:', skip, 'Limit:', limitNum);

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .populate('sellerId', 'name avatar rating totalSales')
        .lean(),
      Product.countDocuments(query),
    ]);

    console.log(`✅ Found ${products.length} products out of ${total}`);

    res.json({
      success: true,
      products: products || [],
      pagination: {
        total: total || 0,
        page: pageNum,
        pages: Math.ceil((total || 0) / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('❌ Error in getProducts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في جلب المنتجات',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('sellerId', 'name avatar rating totalSales bio')
      .lean();
      
    if (!product) {
      return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
    }
    
    // زيادة عدد المشاهدات (غير متزامن)
    Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).catch(() => {});
    
    res.json({ success: true, product });
  } catch (error) {
    console.error('Error in getProduct:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ في جلب المنتج' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;
    let sellerId = req.user.sellerId;

    if (req.user.role === 'admin' && req.body.sellerId) {
      sellerId = req.body.sellerId;
    }

    if (!sellerId) {
      return res.status(400).json({ success: false, message: 'يجب أن تكون بائعاً لإضافة منتجات' });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller || seller.status !== 'active') {
      return res.status(400).json({ success: false, message: 'البائع غير موجود أو غير نشط' });
    }

    if (!productData.image) {
      productData.image = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80';
    }

    productData.sellerId = sellerId;

    const product = await Product.create(productData);

    await Seller.findByIdAndUpdate(sellerId, { $inc: { totalProducts: 1 } });

    emitGlobal('product_created', { product });

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Error in createProduct:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ في إضافة المنتج' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
    }

    if (req.user.role !== 'admin' && product.sellerId.toString() !== req.user.sellerId?.toString()) {
      return res.status(403).json({ success: false, message: 'غير مصرح لك بتعديل هذا المنتج' });
    }

    const allowedUpdates = [
      'name', 'description', 'category', 'productType', 'price', 'oldPrice',
      'stock', 'image', 'images', 'platform', 'region', 'deliveryTime',
      'badge', 'tag', 'isFeatured', 'isFlashSale', 'flashSaleDiscount',
      'flashSaleEnd', 'metaTitle', 'metaDescription', 'seoKeywords'
    ];

    allowedUpdates.forEach(key => {
      if (req.body[key] !== undefined) {
        product[key] = req.body[key];
      }
    });

    await product.save();

    emitGlobal('product_updated', { product });

    res.json({ success: true, product });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ في تحديث المنتج' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
    }

    if (req.user.role !== 'admin' && product.sellerId.toString() !== req.user.sellerId?.toString()) {
      return res.status(403).json({ success: false, message: 'غير مصرح لك بحذف هذا المنتج' });
    }

    await Seller.findByIdAndUpdate(product.sellerId, { $inc: { totalProducts: -1 } });
    await product.deleteOne();

    emitGlobal('product_deleted', { productId: product._id });

    res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ في حذف المنتج' });
  }
};

// ==================== FEATURED PRODUCTS ====================

exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .limit(8)
      .populate('sellerId', 'name avatar rating')
      .lean();
      
    res.json({ success: true, products: products || [] });
  } catch (error) {
    console.error('Error in getFeaturedProducts:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ في جلب المنتجات المميزة' });
  }
};

// ==================== PRODUCT CODES ====================

// @desc    Generate codes for a product
// @route   POST /api/products/:id/codes
// @access  Private (admin/seller)
exports.generateProductCodes = async (req, res) => {
  try {
    const { id } = req.params;
    const { count = 10, expiresAt } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
    }

    // Check permission
    if (req.user.role !== 'admin' && product.sellerId.toString() !== req.user.sellerId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتوليد أكواد لهذا المنتج',
      });
    }

    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = await ProductCode.create({
        productId: product._id,
        expiresAt: expiresAt || null,
      });
      codes.push(code);
    }

    res.status(201).json({
      success: true,
      message: `تم توليد ${codes.length} كود بنجاح`,
      codes,
    });
  } catch (error) {
    console.error('Error in generateProductCodes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get product codes
// @route   GET /api/products/:id/codes
// @access  Private (admin/seller)
exports.getProductCodes = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query; // all, used, unused

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
    }

    // Check permission
    if (req.user.role !== 'admin' && product.sellerId.toString() !== req.user.sellerId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بعرض أكواد هذا المنتج',
      });
    }

    const query = { productId: id };
    if (status === 'used') query.isUsed = true;
    if (status === 'unused') query.isUsed = false;

    const codes = await ProductCode.find(query)
      .populate('orderId', 'orderNumber')
      .populate('usedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, codes });
  } catch (error) {
    console.error('Error in getProductCodes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};