const Reservation = require('../models/Reservation');

// Security check for nosql inject
function sanitize(value) {
  if (typeof value === 'object' && value !== null) {
    for (let key in value) {
      if (key.startsWith('$')) delete value[key];
    }
  }
  return value;
}

// Create reservation
exports.create = async (req, res) => {
  const lab = sanitize(req.body.lab);
  const seat = sanitize(req.body.seat);
  const date = sanitize(req.body.date);
  const startTime = sanitize(req.body.startTime);
  const endTime = sanitize(req.body.endTime);
  const anonymous = req.body.anonymous;
  const walkInName = sanitize(req.body.walkInName);

  if (!lab || !seat || !date || !startTime || !endTime) {
  return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  // You need to be a technician to be able to create walk-in reservations
  if (walkInName && req.session.role !== 'technician') {
    return res.status(403).json({ success: false, message: 'Only technicians can create walk-in reservations' });
  }

  try {


    const reservation = await Reservation.create({
      userId: req.session.userId,
      lab, seat, date, startTime, endTime,
      anonymous: anonymous || false,
      walkInName: walkInName || null
    });
    res.status(201).json({ success: true, reservation });
  } catch (err) {
    if (err.code === 11000) {  //https://www.mongodb.com/docs/manual/reference/error-codes/ 11000 is the error status for duped keys
      return res.status(409).json({ success: false, message: 'This seat is already reserve for that time' }); // 409 is duplicate error code
    }
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

// Remove reservation
exports.remove = async (req, res) => {
  const lab = sanitize(req.body.lab);
  const seat = sanitize(req.body.seat);
  const date = sanitize(req.body.date);
  const startTime = sanitize(req.body.startTime);

  // Technicians can only remove within 10 minutes of the reservation start time
  try {
    const reservation = await Reservation.findOne({lab, seat, date, startTime});
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation cannot be found' });
    }
    
    // Checks if you are the user that reserved the reservation (Need to string them bc they return as objects)
    if (req.session.role !== 'technician' && String(reservation.userId) !== String(req.session.userId)) {
      return res.status(403).json({ success: false, message: 'You can only remove your own reservations' });
    }

    if (req.session.role === 'technician') {
      const [hours, minutes] = reservation.startTime.split(':').map(Number);
      const start = new Date();
      start.setHours(hours, minutes, 0, 0);
      if (Math.abs(start - new Date()) > 10 * 60 * 1000) {
        return res.status(403).json({ success: false, message: 'Reservations can only be removed within 10 minutes of the start time' });
      }
    }

    await reservation.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

// Gets the lab, date, time, (and user) of a reservation
exports.getByLabDateTime = async (req, res) => {
  const lab = sanitize(req.query.lab);
  const date = sanitize(req.query.date);
  const startTime = sanitize(req.query.startTime);

  if (!lab || !date || !startTime) {
    return res.status(400).json({ success: false, message: 'Lab, date, and time are required' });
  }

  try {
    const reservations = await Reservation.find({ lab, date, startTime }).populate('userId', 'username');

    // For each reservation in the database given the filter, return just the seat, and username
    const occupiedSeats = reservations.map(r => ({
      seat: r.seat,
      username: r.walkInName || (r.anonymous ? 'Anonymous' : r.userId.username), // Prioritize walk in name, second anonymous, third actual username. Capitalize anonymous when displaying
      userId: r.userId._id,
      isWalkIn: !!r.walkInName  // Opted to just add a boolean field. Used for removing the link to reservations that are walk in
    }));
    res.json({ success: true, occupiedSeats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};