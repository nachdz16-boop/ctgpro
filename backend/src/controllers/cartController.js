const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { emitToUser } = require('../services/socketService');

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate({
      path: 'items.productId',
      select: 'name price image stock platform',
    });

    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, qty = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
    }

    if (product.stock < qty) {
      return res.status(400).json({ success: false, message: 'المخزون غير كاف' });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(item => item.productId.toString() === productId);

    if (existingItem) {
      if (existingItem.qty + qty > product.stock) {
        return res.status(400).json({ success: false, message: 'المخزون غير كاف' });
      }
      existingItem.qty += qty;
    } else {
      cart.items.push({ productId, qty, price: product.price });
    }

    await cart.save();
    await cart.populate('items.productId', 'name price image stock');

    emitToUser(req.user._id, 'cart_updated', { userId: req.user._id, cart });

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { qty } = req.body;

    if (qty < 0) {
      return res.status(400).json({ success: false, message: 'الكمية يجب أن تكون أكبر من 0' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'السلة فارغة' });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'المنتج غير موجود في السلة' });
    }

    if (qty === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      if (qty > product.stock) {
        return res.status(400).json({ success: false, message: 'المخزون غير كاف' });
      }
      cart.items[itemIndex].qty = qty;
    }

    await cart.save();
    await cart.populate('items.productId', 'name price image stock');

    emitToUser(req.user._id, 'cart_updated', { userId: req.user._id, cart });

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'السلة فارغة' });
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);

    await cart.save();
    await cart.populate('items.productId', 'name price image stock');

    emitToUser(req.user._id, 'cart_updated', { userId: req.user._id, cart });

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
      emitToUser(req.user._id, 'cart_updated', { userId: req.user._id, cart });
    }
    res.json({ success: true, message: 'تم تفريغ السلة' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};