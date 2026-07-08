const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'غير مصرح: لا يوجد رمز توثيق' });
    }
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'المستخدم غير موجود' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'الحساب غير نشط' });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'الرمز غير صالح' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'انتهت صلاحية الرمز' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

const authorize = (...roles) => {
  const allowedRoles = new Set(roles);
  return (req, res, next) => {
    if (!allowedRoles.has(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `الدور "${req.user.role}" غير مصرح له بالوصول إلى هذه الصفحة`,
      });
    }
    next();
  };
};

const isSeller = async (req, res, next) => {
  try {
    if (req.user.role !== 'seller' && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'يجب أن تكون بائعاً للوصول إلى هذه الصفحة',
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { protect, authorize, isSeller };