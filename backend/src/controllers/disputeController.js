const Dispute = require('../models/Dispute');
const Order = require('../models/Order');

exports.getDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate('orderId', 'orderNumber total status')
      .populate('userId', 'name email')
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, disputes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDispute = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('orderId', 'orderNumber total status')
      .populate('userId', 'name email')
      .populate('sellerId', 'name email');
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'النزاع غير موجود' });
    }
    res.json({ success: true, dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateDispute = async (req, res) => {
  try {
    const allowedUpdates = ['status', 'priority', 'resolution'];
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.status === 'resolved' || updates.status === 'closed') {
      updates.resolvedAt = new Date();
      updates.resolvedBy = req.user._id;
    }

    const dispute = await Dispute.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'النزاع غير موجود' });
    }
    res.json({ success: true, dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addDisputeMessage = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'النزاع غير موجود' });
    }

    const message = {
      senderId: req.user._id,
      senderName: req.user.name,
      message: req.body.message,
      attachments: req.body.attachments || [],
    };

    dispute.messages.push(message);
    await dispute.save();
    res.status(201).json({ success: true, dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createDispute = async (req, res) => {
  try {
    const { orderId, title, description, priority } = req.body;
    if (!orderId || !title || !description) {
      return res.status(400).json({ success: false, message: 'يرجى تقديم رقم الطلب والعنوان والوصف' });
    }

    const order = await Order.findOne({ _id: orderId, userId: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود أو غير مرتبط بالمستخدم' });
    }

    const dispute = await Dispute.create({
      orderId: order._id,
      userId: req.user._id,
      sellerId: order.sellerId || null,
      title,
      description,
      priority: priority || 'medium',
      status: 'open',
    });

    res.status(201).json({ success: true, dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find({ userId: req.user._id })
      .populate('orderId', 'orderNumber total status')
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, disputes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyDispute = async (req, res) => {
  try {
    const dispute = await Dispute.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('orderId', 'orderNumber total status')
      .populate('sellerId', 'name email');

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'النزاع غير موجود' });
    }

    res.json({ success: true, dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteDispute = async (req, res) => {
  try {
    const dispute = await Dispute.findByIdAndDelete(req.params.id);
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'النزاع غير موجود' });
    }
    res.json({ success: true, message: 'تم حذف النزاع بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
