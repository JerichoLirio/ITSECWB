const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Made these into objects so we can reference them easily
    lab: { type: String, required: true },
    seat: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }, 
    anonymous: { type: Boolean, default: false },
    walkInName: { type: String, default: null }
});

reservationSchema.index({ lab:1, seat:1, startTime:1, date:1 }, {unique: true});
// https://stackoverflow.com/questions/16061744/mongoose-how-to-define-a-combination-of-fields-to-be-unique - Implementation source
// Maybe make a reference list for every reference we used

module.exports = mongoose.model('Reservation', reservationSchema);
