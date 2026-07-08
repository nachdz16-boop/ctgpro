const os = require('os');
const mongoose = require('mongoose');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const { getIO } = require('../services/socketService');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Dispute = require('../models/Dispute');
const Page = require('../models/Page');
const GiftCard = require('../models/GiftCard');
const PromoCode = require('../models/PromoCode');
const BlogPost = require('../models/BlogPost');
const Notification = require('../models/Notification');
const CarouselItem = require('../models/CarouselItem');
const Announcement = require('../models/Announcement');
const AdminActivityLog = require('../models/AdminActivityLog');
const AdminNote = require('../models/AdminNote');
const NavigationMenu = require('../models/NavigationMenu');
const HomepageSection = require('../models/HomepageSection');
const SocialSettings = require('../models/SocialSettings');
const WalletTransaction = require('../models/WalletTransaction');
const Api = require('../models/Api');
const StoreSettings = require('../models/StoreSettings');
const PaymentGateway = require('../models/PaymentGateway');
const ErrorLog = require('../models/ErrorLog');
const ProductCode = require('../models/ProductCode');

const logAdminActivity = async (req, { action, resource, resourceId, details }) => {
  try {
    await AdminActivityLog.create({
      userId: req.user?._id,
      action,
      resource,
      resourceId: resourceId ? String(resourceId) : undefined,
      details,
      ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    });
  } catch (error) {
    console.error('Failed to create admin activity log:', error);
  }
};

exports.getSystemStatus = async (req, res) => {
  try {
    const forwarded = req.headers['x-forwarded-for'];
    const rawIp = forwarded?.split(',')[0]?.trim() || req.socket?.remoteAddress || req.ip || 'unknown';
    const ip = rawIp.replace(/^::ffff:/, '');

    const memoryUsage = process.memoryUsage();
    const totalRamMb = Math.round(os.totalmem() / 1024 / 1024);
    const freeRamMb = Math.round(os.freemem() / 1024 / 1024);
    const usedRamMb = Math.max(totalRamMb - freeRamMb, 0);
    const heapUsedMb = Math.round(memoryUsage.heapUsed / 1024 / 1024);

    const dbState = mongoose.connection.readyState;
    const dbConnected = dbState === 1;

    let userCount = 0;
    try {
      userCount = await User.countDocuments();
    } catch (countError) {
      userCount = 0;
    }

    res.json({
      success: true,
      systemStatus: {
        ip,
        ram: {
          totalMb: totalRamMb,
          usedMb: usedRamMb,
          heapUsedMb,
        },
        db: {
          connected: dbConnected,
          state: dbState,
          label: dbConnected ? 'متصل' : 'غير متصل',
        },
        userCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== Stats =====
exports.getStats = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [users, sellers, products, orders, disputes, pendingOrders, activeSellers] = await Promise.all([
      User.countDocuments(),
      Seller.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Dispute.countDocuments({ status: 'open' }),
      Order.countDocuments({ status: 'pending' }),
      Seller.countDocuments({ status: 'active' }),
    ]);

    const [revenue, todaysRevenue] = await Promise.all([
      Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: startOfDay, $lte: endOfDay } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    const newOrders = await Order.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } });

    const inventoryTotalResult = await Product.aggregate([
      { $group: { _id: null, totalStock: { $sum: '$stock' } } },
    ]);

    const lowStock = await Product.countDocuments({ stock: { $gt: 0, $lte: 20 } });
    const outOfStock = await Product.countDocuments({ stock: { $lte: 0 } });

    const reservedStockResult = await Cart.aggregate([
      { $unwind: '$items' },
      { $group: { _id: null, qty: { $sum: '$items.qty' } } },
    ]);

    res.json({
      success: true,
      stats: {
        users,
        sellers,
        products,
        orders,
        disputes,
        pendingOrders,
        activeSellers,
        revenue: revenue[0]?.total || 0,
        todaysRevenue: todaysRevenue[0]?.total || 0,
        newOrders,
        inventoryTotal: inventoryTotalResult[0]?.totalStock || 0,
        lowStock,
        outOfStock,
        reservedStock: reservedStockResult[0]?.qty || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await AdminActivityLog.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminNotes = async (req, res) => {
  try {
    const notes = await AdminNote.find()
      .populate('authorId', 'name email role')
      .sort({ pinned: -1, createdAt: -1 })
      .limit(50);

    res.json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAdminNote = async (req, res) => {
  try {
    const content = String(req.body?.content || '').trim();
    const pinned = Boolean(req.body?.pinned);

    if (!content) {
      return res.status(400).json({ success: false, message: 'الملاحظة فارغة' });
    }

    const note = await AdminNote.create({
      authorId: req.user._id,
      content,
      pinned,
    });

    const populatedNote = await note.populate('authorId', 'name email role');
    res.status(201).json({ success: true, note: populatedNote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAdminNote = async (req, res) => {
  try {
    const note = await AdminNote.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'الملاحظة غير موجودة' });
    }

    res.json({ success: true, message: 'تم حذف الملاحظة' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('sellerId', 'name avatar rating totalSales')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAdminProduct = async (req, res) => {
  try {
    const payload = { ...req.body };

    if (!payload.name || (!payload.name.ar && !payload.name.en)) {
      return res.status(400).json({ success: false, message: 'اسم المنتج مطلوب' });
    }

    if (!payload.sellerId) {
      const fallbackSeller = await Seller.findOne({ status: 'active' }).sort({ createdAt: 1 }).lean();
      if (!fallbackSeller) {
        return res.status(400).json({ success: false, message: 'لا يوجد بائع نشط لإنشاء المنتج' });
      }
      payload.sellerId = fallbackSeller._id;
    }

    payload.price = Number(payload.price) || 0;
    payload.oldPrice = payload.oldPrice ? Number(payload.oldPrice) : null;
    payload.stock = Number(payload.stock) || 0;
    payload.isActive = payload.isActive !== false;
    payload.isFeatured = Boolean(payload.isFeatured);
    payload.image = payload.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80';

    const product = await Product.create(payload);
    const populatedProduct = await Product.findById(product._id).populate('sellerId', 'name avatar rating totalSales').lean();

    await Seller.findByIdAndUpdate(product.sellerId, { $inc: { totalProducts: 1 } });
    await logAdminActivity(req, {
      action: 'create',
      resource: 'product',
      resourceId: product._id,
      details: { name: payload.name, category: payload.category, price: payload.price },
    });

    res.status(201).json({ success: true, product: populatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAdminProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
    }

    const allowedFields = [
      'name', 'description', 'category', 'productType', 'price', 'oldPrice', 'stock',
      'image', 'images', 'platform', 'region', 'deliveryTime', 'badge', 'tag',
      'isFeatured', 'isFlashSale', 'flashSaleDiscount', 'flashSaleEnd', 'metaTitle',
      'metaDescription', 'seoKeywords', 'isActive',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    if (req.body.price !== undefined) product.price = Number(req.body.price) || 0;
    if (req.body.oldPrice !== undefined) product.oldPrice = req.body.oldPrice ? Number(req.body.oldPrice) : null;
    if (req.body.stock !== undefined) product.stock = Number(req.body.stock) || 0;
    if (req.body.isFeatured !== undefined) product.isFeatured = Boolean(req.body.isFeatured);
    if (req.body.isActive !== undefined) product.isActive = Boolean(req.body.isActive);

    await product.save();
    const populatedProduct = await Product.findById(product._id).populate('sellerId', 'name avatar rating totalSales').lean();

    await logAdminActivity(req, {
      action: 'update',
      resource: 'product',
      resourceId: product._id,
      details: { updatedFields: Object.keys(req.body || {}) },
    });

    res.json({ success: true, product: populatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAdminProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
    }

    await Product.findByIdAndDelete(req.params.id);
    if (product.sellerId) {
      await Seller.findByIdAndUpdate(product.sellerId, { $inc: { totalProducts: -1 } });
    }

    await logAdminActivity(req, {
      action: 'delete',
      resource: 'product',
      resourceId: product._id,
      details: { name: product.name, category: product.category },
    });

    res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const parseReportDateRange = (dateRange, startDateInput, endDateInput) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  switch (dateRange) {
    case 'today':
      break;
    case 'yesterday':
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      break;
    case 'this_week':
      start.setDate(start.getDate() - start.getDay());
      break;
    case 'this_year':
      start.setMonth(0, 1);
      break;
    case 'custom': {
      const customStart = startDateInput ? new Date(startDateInput) : null;
      const customEnd = endDateInput ? new Date(endDateInput) : null;
      if (customStart && !Number.isNaN(customStart.getTime())) {
        customStart.setHours(0, 0, 0, 0);
        start.setTime(customStart.getTime());
      }
      if (customEnd && !Number.isNaN(customEnd.getTime())) {
        customEnd.setHours(23, 59, 59, 999);
        end.setTime(customEnd.getTime());
      }
      break;
    }
    case 'this_month':
    default:
      start.setDate(1);
      break;
  }

  if (start > end) {
    return parseReportDateRange('this_month');
  }

  const previousDuration = end.getTime() - start.getTime();
  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = new Date(Math.max(previousEnd.getTime() - previousDuration, 0));

  return {
    start,
    end,
    previousStart,
    previousEnd,
  };
};

const calculateChange = (currentValue, previousValue) => {
  if (!previousValue) {
    return currentValue ? 100 : 0;
  }
  return Number((((currentValue - previousValue) / previousValue) * 100).toFixed(1));
};

const getLocalizedValue = (value) => {
  if (value && typeof value === 'object') {
    return value.ar || value.en || value.fr || 'غير محدد';
  }
  return value || 'غير محدد';
};

exports.getReports = async (req, res) => {
  try {
    const {
      reportType = 'overview',
      dateRange = 'this_month',
      startDate,
      endDate,
    } = req.query;

    const range = parseReportDateRange(dateRange, startDate, endDate);

    const [
      totalUsers,
      totalProducts,
      currentUsers,
      currentProducts,
      currentOrders,
      previousUsers,
      previousProducts,
      previousOrders,
      currentRevenueResult,
      previousRevenueResult,
      currentOrdersWithItems,
      activeUsers,
      lowStockCount,
      outOfStockCount,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ createdAt: { $gte: range.start, $lte: range.end } }),
      Product.countDocuments({ createdAt: { $gte: range.start, $lte: range.end } }),
      Order.countDocuments({ createdAt: { $gte: range.start, $lte: range.end } }),
      User.countDocuments({ createdAt: { $gte: range.previousStart, $lte: range.previousEnd } }),
      Product.countDocuments({ createdAt: { $gte: range.previousStart, $lte: range.previousEnd } }),
      Order.countDocuments({ createdAt: { $gte: range.previousStart, $lte: range.previousEnd } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: range.start, $lte: range.end }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: range.previousStart, $lte: range.previousEnd }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.find({ createdAt: { $gte: range.start, $lte: range.end } })
        .populate({ path: 'items.productId', select: 'name category' })
        .sort({ createdAt: 1 })
        .lean(),
      User.countDocuments({ isActive: true }),
      Product.countDocuments({ stock: { $gt: 0, $lte: 20 } }),
      Product.countDocuments({ stock: { $lte: 0 } }),
    ]);

    const currentRevenue = currentRevenueResult[0]?.total || 0;
    const previousRevenue = previousRevenueResult[0]?.total || 0;

    const dailyMap = new Map();
    const categoryRevenueMap = new Map();
    const productRevenueMap = new Map();
    const monthRevenueMap = new Map();
    const orderStatusCounts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      completed: 0,
      failed: 0,
      refunded: 0,
      cancelled: 0,
    };

    const dayCursor = new Date(range.start);
    while (dayCursor <= range.end) {
      const dayKey = dayCursor.toISOString().slice(0, 10);
      dailyMap.set(dayKey, { date: dayKey, revenue: 0, orders: 0 });
      dayCursor.setDate(dayCursor.getDate() + 1);
    }

    currentOrdersWithItems.forEach((order) => {
      if (Object.prototype.hasOwnProperty.call(orderStatusCounts, order.status)) {
        orderStatusCounts[order.status] += 1;
      }

      const orderDateKey = new Date(order.createdAt).toISOString().slice(0, 10);
      if (!dailyMap.has(orderDateKey)) {
        dailyMap.set(orderDateKey, { date: orderDateKey, revenue: 0, orders: 0 });
      }

      const dailyEntry = dailyMap.get(orderDateKey);
      dailyEntry.orders += 1;
      if (order.status === 'completed') {
        dailyEntry.revenue += Number(order.total || 0);
      }

      if (order.status !== 'completed') {
        return;
      }

      const monthKey = new Date(order.createdAt).toLocaleString('ar', {
        month: 'long',
        year: 'numeric',
      });
      if (!monthRevenueMap.has(monthKey)) {
        monthRevenueMap.set(monthKey, 0);
      }
      monthRevenueMap.set(monthKey, monthRevenueMap.get(monthKey) + Number(order.total || 0));

      order.items.forEach((item) => {
        const itemRevenue = Number(item.total || (item.price || 0) * (item.qty || 0));
        const productName = getLocalizedValue(item.productId?.name || item.name);
        const categoryName = getLocalizedValue(item.productId?.category || 'غير مصنف');

        const currentProduct = productRevenueMap.get(productName) || { name: productName, sales: 0, revenue: 0 };
        currentProduct.sales += Number(item.qty || 0);
        currentProduct.revenue += itemRevenue;
        productRevenueMap.set(productName, currentProduct);

        const currentCategory = categoryRevenueMap.get(categoryName) || { name: categoryName, revenue: 0 };
        currentCategory.revenue += itemRevenue;
        categoryRevenueMap.set(categoryName, currentCategory);
      });
    });

    const dailyData = Array.from(dailyMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
    const topProducts = Array.from(productRevenueMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    const topCategories = Array.from(categoryRevenueMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    const monthlyTrend = Array.from(monthRevenueMap.entries()).map(([month, revenue]) => ({ month, revenue }));
    const totalTrackedOrders = currentOrdersWithItems.length || 1;
    const orderStatusLabels = {
      pending: 'معلقة',
      processing: 'قيد المعالجة',
      shipped: 'تم الشحن',
      completed: 'مكتملة',
      failed: 'فشلت',
      refunded: 'مستردة',
      cancelled: 'ملغاة',
    };
    const orderStatusDistribution = Object.entries(orderStatusCounts)
      .map(([status, count]) => ({
        status,
        label: orderStatusLabels[status] || status,
        count,
        percentage: Number(((count / totalTrackedOrders) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.count - a.count);

    const reportData = {
      overview: {
        revenue: currentRevenue,
        revenueChange: calculateChange(currentRevenue, previousRevenue),
        orders: currentOrders,
        ordersChange: calculateChange(currentOrders, previousOrders),
        users: totalUsers,
        usersChange: calculateChange(currentUsers, previousUsers),
        products: totalProducts,
        productsChange: calculateChange(currentProducts, previousProducts),
        dailyData,
        topProducts,
        topCategories,
        monthlyTrend,
        orderStatusDistribution,
      },
      sales: {
        total: currentRevenue,
        averageOrder: currentOrders > 0 ? Number((currentRevenue / currentOrders).toFixed(2)) : 0,
        topCategory: topCategories[0]?.name || 'غير متوفر',
        data: dailyData,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        new: currentUsers,
        data: [],
      },
      products: {
        total: totalProducts,
        new: currentProducts,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
      },
      filters: {
        reportType,
        dateRange,
        startDate: range.start.toISOString(),
        endDate: range.end.toISOString(),
      },
    };

    res.json({ success: true, data: reportData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== Users =====
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecentUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(5);
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }
    user.isActive = isActive;
    await user.save();

    const io = getIO();
    if (io) {
      io.emit('user_updated', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      });
    }

    await logAdminActivity(req, {
      action: isActive ? 'approve' : 'ban',
      resource: 'user',
      resourceId: user._id,
      details: {
        name: user.name,
        email: user.email,
        isActive,
      },
    });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== Sellers =====
exports.getSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().sort({ createdAt: -1 });
    res.json({ success: true, sellers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSellerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'البائع غير موجود' });
    }
    seller.status = status;
    await seller.save();
    const user = await User.findOne({ sellerId: seller._id });
    if (user) {
      user.role = status === 'active' ? 'seller' : 'user';
      await user.save();
    }

    await logAdminActivity(req, {
      action: status === 'active' ? 'approve' : 'reject',
      resource: 'seller',
      resourceId: seller._id,
      details: {
        name: seller.name,
        email: seller.email,
        status,
      },
    });

    res.json({ success: true, seller });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSeller = async (req, res) => {
  try {
    const payload = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone || '',
      storeName: req.body.storeName || '',
      address: req.body.address || '',
      bio: req.body.bio || '',
      status: req.body.status || 'pending',
      rating: Number(req.body.rating) || 0,
      totalSales: Number(req.body.totalSales) || 0,
      totalProducts: Number(req.body.totalProducts) || 0,
    };

    if (!payload.name || !payload.email) {
      return res.status(400).json({ success: false, message: 'اسم البائع والبريد الإلكتروني مطلوبان' });
    }

    const seller = await Seller.create(payload);
    await logAdminActivity(req, {
      action: 'create',
      resource: 'seller',
      resourceId: seller._id,
      details: { name: seller.name, email: seller.email, status: seller.status },
    });

    res.status(201).json({ success: true, seller });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'البائع غير موجود' });
    }

    await User.updateMany({ sellerId: seller._id }, { $set: { sellerId: null, role: 'user' } });
    await Product.updateMany({ sellerId: seller._id }, { $set: { isActive: false } });
    await Seller.findByIdAndDelete(req.params.id);

    await logAdminActivity(req, {
      action: 'delete',
      resource: 'seller',
      resourceId: seller._id,
      details: { name: seller.name, email: seller.email },
    });

    res.json({ success: true, message: 'تم حذف البائع بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== Orders =====
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('sellerId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('sellerId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== Pages =====
exports.getPages = async (req, res) => {
  try {
    const pages = await Page.find().sort({ createdAt: -1 });
    res.json({ success: true, pages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPage = async (req, res) => {
  try {
    const page = await Page.create(req.body);
    res.status(201).json({ success: true, page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePage = async (req, res) => {
  try {
    const page = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!page) {
      return res.status(404).json({ success: false, message: 'الصفحة غير موجودة' });
    }
    res.json({ success: true, page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePage = async (req, res) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);
    if (!page) {
      return res.status(404).json({ success: false, message: 'الصفحة غير موجودة' });
    }
    res.json({ success: true, message: 'تم حذف الصفحة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== Gift Cards =====
exports.getGiftCards = async (req, res) => {
  try {
    const giftCards = await GiftCard.find()
      .populate('usedBy', 'name email')
      .populate('generatedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, giftCards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createGiftCard = async (req, res) => {
  try {
    req.body.generatedBy = req.user._id;
    const giftCard = await GiftCard.create(req.body);
    res.status(201).json({ success: true, giftCard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateGiftCard = async (req, res) => {
  try {
    const giftCard = await GiftCard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!giftCard) {
      return res.status(404).json({ success: false, message: 'البطاقة غير موجودة' });
    }
    res.json({ success: true, giftCard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteGiftCard = async (req, res) => {
  try {
    const giftCard = await GiftCard.findByIdAndDelete(req.params.id);
    if (!giftCard) {
      return res.status(404).json({ success: false, message: 'البطاقة غير موجودة' });
    }
    res.json({ success: true, message: 'تم حذف البطاقة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== Promo Codes =====
exports.getPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, promoCodes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPromoCode = async (req, res) => {
  try {
    req.body.createdBy = req.user._id;
    const promoCode = await PromoCode.create(req.body);
    res.status(201).json({ success: true, promoCode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePromoCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!promoCode) {
      return res.status(404).json({ success: false, message: 'كود الخصم غير موجود' });
    }
    res.json({ success: true, promoCode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePromoCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.findByIdAndDelete(req.params.id);
    if (!promoCode) {
      return res.status(404).json({ success: false, message: 'كود الخصم غير موجود' });
    }
    res.json({ success: true, message: 'تم حذف كود الخصم بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== Product Codes =====
exports.getAdminProductCodes = async (req, res) => {
  try {
    const codes = await ProductCode.find()
      .populate('productId', 'name image category')
      .populate('orderId', 'orderNumber')
      .populate('usedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, codes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAdminProductCode = async (req, res) => {
  try {
    const productId = req.body.productId || (await Product.findOne({ isActive: true }).sort({ createdAt: -1 }).select('_id').lean())?._id;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'المنتج مطلوب لتوليد الكود' });
    }

    const count = Math.min(Math.max(parseInt(req.body.count, 10) || 1, 1), 100);
    const expiresAt = req.body.expiresAt || null;
    const codes = [];

    for (let index = 0; index < count; index += 1) {
      codes.push(await ProductCode.create({ productId, expiresAt }));
    }

    const populatedCodes = await ProductCode.find({ _id: { $in: codes.map((code) => code._id) } })
      .populate('productId', 'name image category')
      .populate('orderId', 'orderNumber')
      .populate('usedBy', 'name email')
      .sort({ createdAt: -1 });

    await logAdminActivity(req, {
      action: 'create',
      resource: 'product-code',
      details: { productId: String(productId), count },
    });

    res.status(201).json({ success: true, codes: populatedCodes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAdminProductCode = async (req, res) => {
  try {
    const code = await ProductCode.findById(req.params.id);
    if (!code) {
      return res.status(404).json({ success: false, message: 'الكود غير موجود' });
    }

    if (req.body.isUsed !== undefined) code.isUsed = Boolean(req.body.isUsed);
    if (req.body.expiresAt !== undefined) code.expiresAt = req.body.expiresAt || null;
    if (req.body.productId) code.productId = req.body.productId;

    await code.save();
    const populatedCode = await ProductCode.findById(code._id)
      .populate('productId', 'name image category')
      .populate('orderId', 'orderNumber')
      .populate('usedBy', 'name email');

    await logAdminActivity(req, {
      action: 'update',
      resource: 'product-code',
      resourceId: code._id,
      details: { isUsed: code.isUsed },
    });

    res.json({ success: true, code: populatedCode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAdminProductCode = async (req, res) => {
  try {
    const code = await ProductCode.findByIdAndDelete(req.params.id);
    if (!code) {
      return res.status(404).json({ success: false, message: 'الكود غير موجود' });
    }

    await logAdminActivity(req, {
      action: 'delete',
      resource: 'product-code',
      resourceId: code._id,
      details: { code: code.code },
    });

    res.json({ success: true, message: 'تم حذف الكود بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== Error Logs =====
exports.getErrorLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const skip = (page - 1) * limit;
    const query = {};
    if (req.query.level) query.status = parseInt(req.query.level, 10);

    const [errors, total] = await Promise.all([
      ErrorLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ErrorLog.countDocuments(query),
    ]);

    res.json({ success: true, errors, meta: { total, page, limit } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== Payment Gateways =====
const normalizePaymentGatewayPayload = (body = {}) => {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const slug = typeof body.slug === 'string' && body.slug.trim()
    ? body.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    : (name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const status = body.status === 'active' ? 'active' : 'inactive';
  const config = body.config && typeof body.config === 'object' ? body.config : {};

  return {
    name,
    slug,
    icon: typeof body.icon === 'string' ? body.icon : '',
    color: typeof body.color === 'string' && body.color.trim() ? body.color.trim() : '#635bff',
    status,
    config,
  };
};

exports.getPaymentGateways = async (req, res) => {
  try {
    const gateways = await PaymentGateway.find().sort({ createdAt: -1 });
    res.json({ success: true, gateways });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActivePaymentGateways = async (req, res) => {
  try {
    const gateways = await PaymentGateway.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json({ success: true, gateways });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPaymentGateway = async (req, res) => {
  try {
    const payload = normalizePaymentGatewayPayload(req.body);
    if (!payload.name) {
      return res.status(400).json({ success: false, message: 'اسم البوابة مطلوب' });
    }

    const gateway = await PaymentGateway.create(payload);
    res.status(201).json({ success: true, gateway });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePaymentGateway = async (req, res) => {
  try {
    const payload = normalizePaymentGatewayPayload(req.body);
    const gateway = await PaymentGateway.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!gateway) return res.status(404).json({ success: false, message: 'Gateway not found' });
    res.json({ success: true, gateway });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePaymentGateway = async (req, res) => {
  try {
    const gateway = await PaymentGateway.findByIdAndDelete(req.params.id);
    if (!gateway) return res.status(404).json({ success: false, message: 'Gateway not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== Blog Posts =====
exports.getBlogPosts = async (req, res) => {
  try {
    const { published } = req.query;
    const query = {};
    if (published !== undefined) query.published = published === 'true';
    
    const blogPosts = await BlogPost.find(query)
      .populate('authorId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, blogPosts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBlogPost = async (req, res) => {
  try {
    req.body.authorId = req.user._id;
    const blogPost = await BlogPost.create(req.body);
    res.status(201).json({ success: true, blogPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBlogPost = async (req, res) => {
  try {
    const blogPost = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!blogPost) {
      return res.status(404).json({ success: false, message: 'المقال غير موجود' });
    }
    res.json({ success: true, blogPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBlogPost = async (req, res) => {
  try {
    const blogPost = await BlogPost.findByIdAndDelete(req.params.id);
    if (!blogPost) {
      return res.status(404).json({ success: false, message: 'المقال غير موجود' });
    }
    res.json({ success: true, message: 'تم حذف المقال بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== Notifications =====
exports.getNotifications = async (req, res) => {
  try {
    const { userId, isRead } = req.query;
    const query = {};
    if (userId) query.userId = userId;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const normalizeLocalizedText = (value) => {
      if (value && typeof value === 'object') {
        return {
          ar: value.ar || value.en || value.fr || '',
          en: value.en || value.ar || value.fr || '',
          fr: value.fr || value.en || value.ar || '',
        };
      }

      const text = typeof value === 'string' ? value.trim() : '';
      return { ar: text, en: text, fr: text };
    };

    const resolveRecipientIds = async () => {
      if (req.body.userId) {
        return [req.body.userId];
      }

      const targetUsers = req.body.targetUsers || 'all';
      if (targetUsers === 'specific' && Array.isArray(req.body.specificUsers) && req.body.specificUsers.length > 0) {
        return req.body.specificUsers;
      }

      const query = {};
      if (targetUsers === 'roles' && Array.isArray(req.body.roles) && req.body.roles.length > 0) {
        query.role = { $in: req.body.roles };
      }

      const users = await User.find(query).select('_id').lean();
      return users.map((user) => user._id);
    };

    const recipientIds = await resolveRecipientIds();
    if (recipientIds.length === 0) {
      return res.status(400).json({ success: false, message: 'لم يتم تحديد مستخدمين للإشعار' });
    }

    const notificationPayload = {
      title: normalizeLocalizedText(req.body.title),
      message: normalizeLocalizedText(req.body.message),
      type: req.body.type || 'system',
      icon: req.body.icon || '',
      link: req.body.link || '',
      metadata: req.body.metadata || {},
    };

    const notifications = await Notification.insertMany(
      recipientIds.map((userId) => ({
        ...notificationPayload,
        userId,
      }))
    );

    const io = getIO();
    if (io) {
      notifications.forEach((notification) => {
        io.to(`user_${notification.userId}`).emit('notification_created', notification);
      });
    }

    await logAdminActivity(req, {
      action: 'create',
      resource: 'notification',
      resourceId: notifications[0]?._id,
      details: {
        title: notificationPayload.title,
        type: notificationPayload.type,
        recipients: recipientIds.length,
      },
    });

    res.status(201).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'الإشعار غير موجود' });
    }

    if (req.body.title !== undefined) notification.title = req.body.title;
    if (req.body.message !== undefined) notification.message = req.body.message;
    if (req.body.type !== undefined) notification.type = req.body.type;
    if (req.body.icon !== undefined) notification.icon = req.body.icon;
    if (req.body.link !== undefined) notification.link = req.body.link;
    if (req.body.metadata !== undefined) notification.metadata = req.body.metadata;

    await notification.save();

    await logAdminActivity(req, {
      action: 'update',
      resource: 'notification',
      resourceId: notification._id,
      details: { title: notification.title, type: notification.type },
    });

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'الإشعار غير موجود' });
    }
    await notification.markAsRead();
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true, message: 'تم تحديد جميع الإشعارات كمقروءة' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'الإشعار غير موجود' });
    }
    res.json({ success: true, message: 'تم حذف الإشعار' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== Carousel Items =====
exports.getCarouselItems = async (req, res) => {
  try {
    const carouselItems = await CarouselItem.find().sort({ order: 1 });
    res.json({ success: true, carouselItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCarouselItem = async (req, res) => {
  try {
    const carouselItem = await CarouselItem.create(req.body);
    res.status(201).json({ success: true, carouselItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCarouselItem = async (req, res) => {
  try {
    const carouselItem = await CarouselItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!carouselItem) {
      return res.status(404).json({ success: false, message: 'العنصر غير موجود' });
    }
    res.json({ success: true, carouselItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCarouselItem = async (req, res) => {
  try {
    const carouselItem = await CarouselItem.findByIdAndDelete(req.params.id);
    if (!carouselItem) {
      return res.status(404).json({ success: false, message: 'العنصر غير موجود' });
    }
    res.json({ success: true, message: 'تم حذف العنصر بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== Announcements =====
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ priority: -1, createdAt: -1 });
    res.json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create(req.body);
    res.status(201).json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    }
    res.json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    }
    res.json({ success: true, message: 'تم حذف الإعلان بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== Navigation Menus =====
exports.getNavigationMenus = async (req, res) => {
  try {
    const menus = await NavigationMenu.find().sort({ createdAt: -1 });
    res.json({ success: true, menus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createNavigationMenu = async (req, res) => {
  try {
    const menu = await NavigationMenu.create(req.body);
    res.status(201).json({ success: true, menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateNavigationMenu = async (req, res) => {
  try {
    const menu = await NavigationMenu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!menu) {
      return res.status(404).json({ success: false, message: 'القائمة غير موجودة' });
    }
    res.json({ success: true, menu });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNavigationMenu = async (req, res) => {
  try {
    const menu = await NavigationMenu.findByIdAndDelete(req.params.id);
    if (!menu) {
      return res.status(404).json({ success: false, message: 'القائمة غير موجودة' });
    }
    res.json({ success: true, message: 'تم حذف القائمة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== Homepage Sections =====
exports.getHomepageSections = async (req, res) => {
  try {
    const sections = await HomepageSection.find().sort({ order: 1 });
    res.json({ success: true, sections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createHomepageSection = async (req, res) => {
  try {
    const section = await HomepageSection.create(req.body);
    res.status(201).json({ success: true, section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateHomepageSection = async (req, res) => {
  try {
    const section = await HomepageSection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!section) {
      return res.status(404).json({ success: false, message: 'القسم غير موجود' });
    }
    res.json({ success: true, section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteHomepageSection = async (req, res) => {
  try {
    const section = await HomepageSection.findByIdAndDelete(req.params.id);
    if (!section) {
      return res.status(404).json({ success: false, message: 'القسم غير موجود' });
    }
    res.json({ success: true, message: 'تم حذف القسم بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== Social Settings =====
exports.getSocialSettings = async (req, res) => {
  try {
    let settings = await SocialSettings.findOne();
    if (!settings) {
      settings = await SocialSettings.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSocialSettings = async (req, res) => {
  try {
    let settings = await SocialSettings.findOne();
    if (!settings) {
      settings = new SocialSettings();
    }
    Object.assign(settings, req.body);
    await settings.save();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== APIs Management =====
exports.getApis = async (req, res) => {
  try {
    const apis = await Api.find().sort({ createdAt: -1 });
    res.json({ success: true, apis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getApiKeys = async (req, res) => {
  try {
    const keys = await Api.find().select('name apiKey isActive');
    res.json({ success: true, keys });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getApiLogs = async (req, res) => {
  try {
    const apiItem = await Api.findById(req.params.id).select('logs');
    if (!apiItem) return res.status(404).json({ success: false, message: 'API غير موجودة' });
    res.json({ success: true, logs: apiItem.logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createApi = async (req, res) => {
  try {
    const apiData = {
      ...req.body,
      apiKey: req.body.apiKey || Math.random().toString(36).slice(2, 18),
      createdBy: req.user._id,
    };
    const apiItem = await Api.create(apiData);
    res.status(201).json({ success: true, api: apiItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateApi = async (req, res) => {
  try {
    const apiItem = await Api.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!apiItem) return res.status(404).json({ success: false, message: 'API غير موجودة' });
    res.json({ success: true, api: apiItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteApi = async (req, res) => {
  try {
    const apiItem = await Api.findByIdAndDelete(req.params.id);
    if (!apiItem) return res.status(404).json({ success: false, message: 'API غير موجودة' });
    res.json({ success: true, message: 'تم حذف API بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleApiStatus = async (req, res) => {
  try {
    const apiItem = await Api.findById(req.params.id);
    if (!apiItem) return res.status(404).json({ success: false, message: 'API غير موجودة' });
    apiItem.isActive = !apiItem.isActive;
    await apiItem.save();
    res.json({ success: true, api: apiItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.regenerateApiKey = async (req, res) => {
  try {
    const apiItem = await Api.findById(req.params.id);
    if (!apiItem) return res.status(404).json({ success: false, message: 'API غير موجودة' });
    apiItem.apiKey = Math.random().toString(36).slice(2, 18);
    await apiItem.save();
    res.json({ success: true, apiKey: apiItem.apiKey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== Store Management =====
exports.getStoreData = async (req, res) => {
  try {
    let storeSettings = await StoreSettings.findOne();
    if (!storeSettings) {
      storeSettings = await StoreSettings.create({});
    }
    res.json({ success: true, store: {
      name: storeSettings.name,
      description: storeSettings.description,
      email: storeSettings.email,
      phone: storeSettings.phone,
      address: storeSettings.address,
      city: storeSettings.city,
      country: storeSettings.country,
      logo: storeSettings.logo,
      favicon: storeSettings.favicon
    }, settings: storeSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStoreData = async (req, res) => {
  try {
    let storeSettings = await StoreSettings.findOne();
    if (!storeSettings) {
      storeSettings = new StoreSettings();
    }
    Object.assign(storeSettings, req.body);
    await storeSettings.save();

    await logAdminActivity(req, {
      action: 'update',
      resource: 'settings',
      resourceId: storeSettings._id,
      details: {
        name: storeSettings.name,
        updatedFields: Object.keys(req.body || {}),
      },
    });

    res.json({ success: true, settings: storeSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStoreFiles = async (req, res) => {
  try {
    const storeSettings = await StoreSettings.findOne();
    res.json({ success: true, files: storeSettings?.files || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.uploadStoreFile = async (req, res) => {
  try {
    const storeSettings = await StoreSettings.findOne() || await StoreSettings.create({});
    if (!req.file) return res.status(400).json({ success: false, message: 'الملف غير موجود' });
    const fileRecord = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      type: req.body.type || req.file.mimetype,
      url: `/uploads/${req.file.filename}`,
      uploadedAt: new Date()
    };
    storeSettings.files.push(fileRecord);
    await storeSettings.save();
    res.json({ success: true, file: fileRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteStoreFile = async (req, res) => {
  try {
    const storeSettings = await StoreSettings.findOne();
    if (!storeSettings) return res.status(404).json({ success: false, message: 'إعدادات المتجر غير موجودة' });
    const fileIndex = storeSettings.files.findIndex(f => f._id.toString() === req.params.id);
    if (fileIndex === -1) return res.status(404).json({ success: false, message: 'الملف غير موجود' });
    const [deletedFile] = storeSettings.files.splice(fileIndex, 1);
    await storeSettings.save();
    res.json({ success: true, file: deletedFile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStoreLogs = async (req, res) => {
  try {
    const storeSettings = await StoreSettings.findOne();
    res.json({ success: true, logs: storeSettings?.logs || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStoreBackups = async (req, res) => {
  try {
    const storeSettings = await StoreSettings.findOne();
    res.json({ success: true, backups: storeSettings?.backups || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createStoreBackup = async (req, res) => {
  try {
    const storeSettings = await StoreSettings.findOne() || await StoreSettings.create({});
    const backupId = Math.random().toString(36).slice(2, 12);
    const snapshot = storeSettings.toObject();
    delete snapshot._id;
    delete snapshot.createdAt;
    delete snapshot.updatedAt;
    const backupRecord = {
      backupId,
      filename: `${backupId}.json`,
      path: '',
      size: Buffer.byteLength(JSON.stringify(snapshot), 'utf8'),
      snapshot,
      createdAt: new Date()
    };
    storeSettings.backups.push(backupRecord);
    await storeSettings.save();
    res.status(201).json({ success: true, backup: backupRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.restoreStoreBackup = async (req, res) => {
  try {
    const storeSettings = await StoreSettings.findOne();
    if (!storeSettings) return res.status(404).json({ success: false, message: 'إعدادات المتجر غير موجودة' });
    const backup = storeSettings.backups.find(b => b.backupId === req.params.id);
    if (!backup) return res.status(404).json({ success: false, message: 'النسخة الاحتياطية غير موجودة' });

    const snapshot = backup.snapshot;
    if (!snapshot || typeof snapshot !== 'object') {
      return res.status(400).json({ success: false, message: 'النسخة الاحتياطية لا تحتوي على بيانات قابلة للاسترجاع' });
    }

    const nextState = { ...snapshot };
    delete nextState._id;
    delete nextState.createdAt;
    delete nextState.updatedAt;
    delete nextState.backups;

    Object.assign(storeSettings, nextState);
    await storeSettings.save();

    await logAdminActivity(req, {
      action: 'restore',
      resource: 'store-backup',
      resourceId: backup.backupId,
      details: { filename: backup.filename },
    });

    res.json({ success: true, message: 'تم استرجاع النسخة الاحتياطية بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteStoreBackup = async (req, res) => {
  try {
    const storeSettings = await StoreSettings.findOne();
    if (!storeSettings) return res.status(404).json({ success: false, message: 'إعدادات المتجر غير موجودة' });
    const backupIndex = storeSettings.backups.findIndex(b => b.backupId === req.params.id);
    if (backupIndex === -1) return res.status(404).json({ success: false, message: 'النسخة الاحتياطية غير موجودة' });
    const [deletedBackup] = storeSettings.backups.splice(backupIndex, 1);
    await storeSettings.save();
    res.json({ success: true, backup: deletedBackup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.downloadStoreBackup = async (req, res) => {
  try {
    const storeSettings = await StoreSettings.findOne();
    if (!storeSettings) return res.status(404).json({ success: false, message: 'إعدادات المتجر غير موجودة' });
    const backup = storeSettings.backups.find(b => b.backupId === req.params.id);
    if (!backup) return res.status(404).json({ success: false, message: 'النسخة الاحتياطية غير موجودة' });
    const payload = JSON.stringify(backup.snapshot || backup, null, 2);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${backup.filename || `${backup.backupId}.json`}"`);
    res.status(200).send(payload);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStore2FA = async (req, res) => {
  try {
    let storeSettings = await StoreSettings.findOne();
    if (!storeSettings) {
      storeSettings = await StoreSettings.create({});
    }
    storeSettings.twoFactorAuth = req.body;
    await storeSettings.save();
    res.json({ success: true, settings: storeSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

