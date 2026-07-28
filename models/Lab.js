const mongoose = require('mongoose');
const { LABS } = require('../utils/security');

const labSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, enum: LABS },
  isBlocked: { type: Boolean, default: false },
  blockedReason: { type: String, maxlength: 200, default: '' },
  blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  blockedAt: { type: Date, default: null }
});

module.exports = mongoose.model('Lab', labSchema);