const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'lab_manager', 'admin'], required: true, default: 'student' },
  profilePicture: { type: String },
  description: { type: String, maxlength: 300 },
  rememberMeUntil: { type: Date },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
  lastSuccessfulLoginAt: { type: Date, default: null },
  lastFailedLoginAt: { type: Date, default: null },
  lastLoginMessage: { type: String, default: '' },
  passwordChangedAt: { type: Date, default: Date.now },
  passwordHistory: [{ type: String }],
  securityQuestion: { type: String, maxlength: 120 },
  securityAnswerHash: { type: String },
  createdAt: { type: Date, default: Date.now }
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

userSchema.virtual('reservations', {
  ref: 'Reservation',
  localField: '_id',
  foreignField: 'userId'
});

module.exports = mongoose.model('User', userSchema);
