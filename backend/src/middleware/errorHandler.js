const ErrorLog = require('../models/ErrorLog');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `هذا ${field} مستخدم بالفعل`;
    error = { message, status: 400 };
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = { message: messages.join(', '), status: 400 };
  }

  if (err.name === 'CastError') {
    error = { message: 'معرف غير صالح', status: 404 };
  }

  // Persist server errors to DB (non-blocking)
  try {
    const log = {
      message: error.message || err.message || 'Unknown error',
      stack: err.stack,
      status: error.status || 500,
      method: req.method,
      route: req.originalUrl,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      meta: {
        body: req.body && Object.keys(req.body).length ? { ...req.body } : undefined,
        query: req.query && Object.keys(req.query).length ? { ...req.query } : undefined,
      },
    };
    if (req.user?.id) log.userId = req.user.id;
    ErrorLog.create(log).catch((e) => console.warn('Failed saving error log', e.message));
  } catch (loggingErr) {
    console.warn('Error logging failed:', loggingErr.message);
  }

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'حدث خطأ في الخادم',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;