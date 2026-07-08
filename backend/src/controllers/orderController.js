const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Notification = require('../models/Notification');
const emailService = require('../services/emailService');
const { emitToUser } = require('../services/socketService');
const crypto = require('crypto');

exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, email, phone, notes } = req.body;

    let cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'السلة فارغة' });
    }

    let subtotal = 0;
    const orderItems = [];
    const sellerIds = new Set();

    for (const item of cart.items) {
      const product = item.productId;
      if (!product) continue;

      if (product.stock < item.qty) {
        return res.status(400).json({
          success: false,
          message: `المنتج ${product.name.ar} غير متوفر بالمخزون المطلوب`,
        });
      }

      subtotal += product.price * item.qty;
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        qty: item.qty,
        total: product.price * item.qty,
      });
      sellerIds.add(product.sellerId.toString());
    }

    const total = subtotal;
    const user = await User.findById(req.user._id);
    const paymentMethod = req.body.paymentMethod || 'card';
    const paymentGateway = req.body.paymentGateway || '';
    const paymentDetails = req.body.paymentDetails || {};

    const paymentId = req.body.paymentId || req.body.transactionId || crypto.randomUUID();
    const isImmediatePayment = ['card', 'paypal', 'crypto', 'ctgpeo_credit'].includes(paymentMethod);
    const paymentStatus = isImmediatePayment ? 'paid' : 'pending';

    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      subtotal,
      discount: 0,
      total,
      status: isImmediatePayment ? 'processing' : 'pending',
      email,
      phone: phone || req.user.phone,
      shippingAddress,
      notes,
      sellerId: sellerIds.size === 1 ? [...sellerIds][0] : null,
      paymentMethod,
      paymentGateway,
      paymentStatus,
      paymentId,
      paymentDetails: paymentDetails,
    });

    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);
      if (product) {
        product.stock -= item.qty;
        product.purchases += item.qty;
        await product.save();
      }
    }

    for (const sellerId of sellerIds) {
      await Seller.findByIdAndUpdate(sellerId, { $inc: { totalSales: 1 } });
    }

    if (user) {
      user.rewards = (user.rewards || 0) + Math.floor(total / 10);
      await user.save();
    }

    cart.items = [];
    cart.couponCode = null;
    await cart.save();

    await emailService.sendOrderConfirmation(email, order);

    const notification = await Notification.create({
      userId: req.user._id,
      title: 'طلب جديد',
      message: `تم إنشاء الطلب #${order.orderNumber} بنجاح`,
      type: 'order',
      link: `/orders/${order._id}`,
    });

    emitToUser(req.user._id, 'order_created', { userId: req.user._id, order });
    emitToUser(req.user._id, 'notification_created', notification);

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }

    if (order.status !== 'pending' && order.status !== 'processing') {
      return res.status(400).json({ success: false, message: 'لا يمكن إلغاء الطلب في حالته الحالية' });
    }

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.qty } });
    }

    order.status = 'cancelled';
    order.cancelledDate = new Date();
    await order.save();

    const notification = await Notification.create({
      userId: req.user._id,
      title: 'تم إلغاء الطلب',
      message: `تم إلغاء الطلب #${order.orderNumber} بنجاح`,
      type: 'order',
      link: `/orders/${order._id}`,
    });

    emitToUser(req.user._id, 'order_updated', { userId: req.user._id, order });
    emitToUser(req.user._id, 'notification_created', notification);

    res.json({ success: true, message: 'تم إلغاء الطلب بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};