const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const AdminActivityLog = require('../models/AdminActivityLog');
const Seller = require('../models/Seller');
const config = require('../config/config');
const emailService = require('../services/emailService');
const { getIO } = require('../services/socketService');

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, { expiresIn: config.jwtExpire });
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role = 'user' } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'البريد الإلكتروني مسجل مسبقاً' });
    }

    const user = await User.create({ name, email, phone, password, role });

    if (role === 'seller') {
      const seller = await Seller.create({ name, email, phone, status: 'pending', verificationStatus: 'pending' });
      user.sellerId = seller._id;
      await user.save();
    }

    let emailWarning = null;
    try {
      await emailService.sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError.message);
      emailWarning = 'تم إنشاء الحساب لكن تعذر إرسال رسالة الترحيب عبر البريد الإلكتروني';
    }

    const io = getIO();
    if (io) {
      io.emit('user_created', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      warning: emailWarning,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        referralCode: user.referralCode,
        rewards: user.rewards,
        isVerified: user.isVerified,
        walletBalance: user.walletBalance || 0,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });

    if (!user) {
      return res.status(401).json({ success: false, message: 'البريد أو رقم الهاتف غير صحيح' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'الحساب غير نشط، يرجى التواصل مع الدعم' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        referralCode: user.referralCode,
        rewards: user.rewards,
        isVerified: user.isVerified,
        walletBalance: user.walletBalance || 0,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('sellerId', 'name avatar rating totalSales status');
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }
    res.json({
      success: true,
      user: {
        ...user.toObject(),
        walletBalance: user.walletBalance || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, preferences, bio } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (address) user.address = { ...user.address, ...address };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    await AdminActivityLog.create({
      userId: req.user._id,
      action: 'update',
      resource: 'profile',
      resourceId: user._id,
      details: { name, phone, bio },
      ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        avatar: user.avatar,
        address: user.address,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' });
    }

    user.password = newPassword;
    await user.save();

    await AdminActivityLog.create({
      userId: req.user._id,
      action: 'update',
      resource: 'profile',
      resourceId: user._id,
      details: { field: 'password' },
      ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    });

    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'يجب رفع صورة' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();

    await AdminActivityLog.create({
      userId: req.user._id,
      action: 'update',
      resource: 'profile',
      resourceId: user._id,
      details: { field: 'avatar' },
      ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        referralCode: user.referralCode,
        rewards: user.rewards,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    res.json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        address: user.address,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    await user.deleteOne();
    res.json({ success: true, message: 'تم حذف الحساب بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'لا يوجد مستخدم بهذا البريد الإلكتروني' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 3600000;
    await user.save();

    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      if (emailError.code === 'SMTP_AUTH_FAILED' || emailError.code === 'EMAIL_NOT_CONFIGURED') {
        return res.status(503).json({
          success: false,
          message: 'تعذر إرسال البريد الآن. يرجى ضبط إعدادات SMTP ثم إعادة المحاولة.',
        });
      }
      throw emailError;
    }

    res.json({ success: true, message: 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'الرمز غير صالح أو منتهي الصلاحية' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};