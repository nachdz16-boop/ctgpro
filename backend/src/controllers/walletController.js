const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const Notification = require('../models/Notification');
const { emitToUser } = require('../services/socketService');

exports.getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance walletTransactions');
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    const transactions = await WalletTransaction.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    const totalDeposits = transactions
      .filter((tx) => tx.type === 'deposit' || tx.type === 'credit')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalWithdrawals = transactions
      .filter((tx) => tx.type === 'withdrawal' || tx.type === 'debit')
      .reduce((sum, tx) => sum + tx.amount, 0);

    res.json({
      success: true,
      wallet: {
        balance: user.walletBalance,
        cryptoBalances: {
          BTC: 0,
          ETH: 0,
          USDT: 0,
        },
        totalDeposits,
        totalWithdrawals,
      },
      transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deposit = async (req, res) => {
  try {
    const { amount, method, address } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'الرجاء إدخال مبلغ صالح للإيداع' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    user.walletBalance = (user.walletBalance || 0) + amount;
    await user.save();

    const transaction = await WalletTransaction.create({
      userId: user._id,
      amount,
      type: 'deposit',
      description: `إيداع عبر ${method || 'محفظة'}`,
      status: 'completed',
      metadata: { method, address },
    });

    const notification = await Notification.create({
      userId: user._id,
      title: 'تم إضافة رصيد',
      message: `تم إضافة ${amount} بنجاح إلى محفظتك`,
      type: 'payment',
      link: '/wallet',
    });

    emitToUser(user._id, 'wallet_updated', {
      userId: user._id,
      walletBalance: user.walletBalance,
      transaction,
    });
    emitToUser(user._id, 'wallet_transaction_created', {
      userId: user._id,
      transaction,
    });
    emitToUser(user._id, 'notification_created', notification);

    res.status(201).json({ success: true, wallet: { balance: user.walletBalance }, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.withdraw = async (req, res) => {
  try {
    const { amount, method, address } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'الرجاء إدخال مبلغ صالح للسحب' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    if ((user.walletBalance || 0) < amount) {
      return res.status(400).json({ success: false, message: 'الرصيد غير كافٍ للسحب' });
    }

    user.walletBalance -= amount;
    await user.save();

    const transaction = await WalletTransaction.create({
      userId: user._id,
      amount,
      type: 'withdrawal',
      description: `طلب سحب عبر ${method || 'محفظة'}`,
      status: 'pending',
      metadata: { method, address },
    });

    const notification = await Notification.create({
      userId: user._id,
      title: 'طلب سحب جديد',
      message: `تم طلب سحب ${amount} من محفظتك، سيتم المراجعة قريباً`,
      type: 'payment',
      link: '/wallet',
    });

    emitToUser(user._id, 'wallet_updated', {
      userId: user._id,
      walletBalance: user.walletBalance,
      transaction,
    });
    emitToUser(user._id, 'wallet_transaction_created', {
      userId: user._id,
      transaction,
    });
    emitToUser(user._id, 'notification_created', notification);

    res.status(201).json({ success: true, wallet: { balance: user.walletBalance }, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
