const Reservation = require('../models/Reservation');
const { cleanString, isValidReservationInput, isValidDate, LABS, SEATS, TIMES, writeLog } = require('../utils/security');

exports.create = async (req, res) => {
  const lab = cleanString(req.body.lab);
  const seat = cleanString(req.body.seat);
  const date = cleanString(req.body.date);
  const startTime = cleanString(req.body.startTime);
  const endTime = cleanString(req.body.endTime);
  const anonymous = req.body.anonymous === true || req.body.anonymous === 'true';
  const walkInName = cleanString(req.body.walkInName || '');

  if (!isValidReservationInput({ lab, seat, date, startTime, endTime })) {
    await writeLog(req, 'VALIDATION', 'failure', { form: 'reservation-create' });
    return res.status(400).json({ success: false, message: 'Invalid reservation details.' });
  }

  if (walkInName && (req.session.role !== 'lab_manager' && req.session.role !== 'admin')) {
    await writeLog(req, 'ACCESS_CONTROL', 'failure', { action: 'walk-in reservation' });
    return res.status(403).json({ success: false, message: 'Only Lab Managers can create walk-in reservations.' });
  }

  if (walkInName && (walkInName.length < 2 || walkInName.length > 60)) {
    await writeLog(req, 'VALIDATION', 'failure', { form: 'walk-in-name' });
    return res.status(400).json({ success: false, message: 'Walk-in name must be 2-60 characters.' });
  }

  try {
    const reservation = await Reservation.create({
      userId: req.session.userId,
      lab,
      seat,
      date,
      startTime,
      endTime,
      anonymous,
      walkInName: walkInName || null
    });
    await writeLog(req, 'RESERVATION_CREATE', 'success', { lab, seat, date, startTime, walkIn: !!walkInName });
    res.status(201).json({ success: true, reservation });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'This seat is already reserved for that time.' });
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
};

exports.update = async (req, res) => {
  const lab = cleanString(req.body.lab);
  const seat = cleanString(req.body.seat);
  const date = cleanString(req.body.date);
  const startTime = cleanString(req.body.startTime);
  const endTime = cleanString(req.body.endTime);

  if (!isValidReservationInput({ lab, seat, date, startTime, endTime })) {
    await writeLog(req, 'VALIDATION', 'failure', { form: 'reservation-update' });
    return res.status(400).json({ success: false, message: 'Invalid reservation details.' });
  }

  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation cannot be found.' });

    const isOwner = String(reservation.userId) === String(req.session.userId);
    const canManage = ['lab_manager', 'admin'].includes(req.session.role);
    if (!isOwner && !canManage) {
      await writeLog(req, 'ACCESS_CONTROL', 'failure', { action: 'update reservation', reservationId: reservation._id });
      return res.status(403).json({ success: false, message: 'You can only modify your own reservations.' });
    }

    reservation.lab = lab;
    reservation.seat = seat;
    reservation.date = date;
    reservation.startTime = startTime;
    reservation.endTime = endTime;

    await reservation.save();
    await writeLog(req, 'RESERVATION_UPDATE', 'success', { reservationId: reservation._id, lab, seat, date, startTime });
    res.json({ success: true, reservation });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'This seat is already reserved for that time.' });
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
};

exports.remove = async (req, res) => {
  const lab = cleanString(req.body.lab);
  const seat = cleanString(req.body.seat);
  const date = cleanString(req.body.date);
  const startTime = cleanString(req.body.startTime);

  if (!LABS.includes(lab) || !SEATS.includes(seat) || !isValidDate(date) || !TIMES.includes(startTime)) {
    await writeLog(req, 'VALIDATION', 'failure', { form: 'reservation-delete' });
    return res.status(400).json({ success: false, message: 'Invalid delete request.' });
  }

  try {
    const reservation = await Reservation.findOne({ lab, seat, date, startTime });
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation cannot be found.' });

    const isOwner = String(reservation.userId) === String(req.session.userId);
    const canManage = ['lab_manager', 'admin'].includes(req.session.role);
    if (!isOwner && !canManage) {
      await writeLog(req, 'ACCESS_CONTROL', 'failure', { action: 'delete reservation', reservationId: reservation._id });
      return res.status(403).json({ success: false, message: 'You can only remove your own reservations.' });
    }

    await reservation.deleteOne();
    await writeLog(req, 'RESERVATION_DELETE', 'success', { lab, seat, date, startTime });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
};

exports.getByLabDateTime = async (req, res) => {
  const lab = cleanString(req.query.lab);
  const date = cleanString(req.query.date);
  const startTime = cleanString(req.query.startTime);

  if (!LABS.includes(lab) || !isValidDate(date) || !TIMES.includes(startTime)) {
    await writeLog(req, 'VALIDATION', 'failure', { form: 'reservation-search' });
    return res.status(400).json({ success: false, message: 'Lab, date, and time are required.' });
  }

  try {
    const reservations = await Reservation.find({ lab, date, startTime }).populate('userId', 'username').lean();
    const occupiedSeats = reservations.map(r => ({
      seat: r.seat,
      username: r.walkInName || (r.anonymous ? 'Anonymous' : r.userId.username),
      userId: r.userId._id,
      isWalkIn: !!r.walkInName,
      reservationId: r._id
    }));
    res.json({ success: true, occupiedSeats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
};
