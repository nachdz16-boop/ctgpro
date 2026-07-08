const mongoose = require('mongoose');

const ErrorLogSchema = new mongoose.Schema({
  message: { type: String, required: true },
  stack: String,
  status: Number,
  method: String,
  route: String,
  ipAddress: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userAgent: String,
  meta: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

module.exports = mongoose.model('ErrorLog', ErrorLogSchema);
