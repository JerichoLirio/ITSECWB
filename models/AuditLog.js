const mongoose = require('mongoose');

// 2.4.3 logs support both success and failure
const auditLogSchema = new mongoose.Schema({
  eventType: { type: String, required: true },
  status: { type: String, enum: ['success', 'failure'], required: true },
  username: { type: String, default: 'unknown' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  role: { type: String, default: 'guest' },
  ipAddress: { type: String },
  method: { type: String },
  path: { type: String },
  details: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
