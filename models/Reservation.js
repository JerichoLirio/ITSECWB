const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lab: { type: String, enum: ['G404A', 'G404B', 'V101'], required: true },
  seat: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  anonymous: { type: Boolean, default: false },
  walkInName: { type: String, default: null, maxlength: 60 },
  createdAt: { type: Date, default: Date.now }
});

reservationSchema.index({ lab: 1, seat: 1, startTime: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Reservation', reservationSchema);
