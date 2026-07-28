const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Reservation = require('../models/Reservation');
const { cleanString, roleLabel, LABS, writeLog } = require('../utils/security');
const Lab = require('../models/Lab');


exports.dashboard = async (req, res) => {
  const users = await User.find().select('username email role createdAt lockUntil').sort({ role: 1, username: 1 }).lean();
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50).lean();
  res.render('admin_dashboard', {
    title: 'Admin Dashboard',
    username: req.session.username,
    role: req.session.role,
    viewerRoleLabel: roleLabel(req.session.role),
    lastLoginNotice: req.session.lastLoginNotice,
    users,
    logs,
    css: ['/css/admin.css'],
    js: ['/js/admin.js']
  });
};

exports.logs = async (req, res) => {
  const eventType = cleanString(req.query.eventType || '');
  const status = cleanString(req.query.status || '');
  const filter = {};
  if (eventType) filter.eventType = eventType;
  if (status && ['success', 'failure'].includes(status)) filter.status = status;
  const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  res.json({ success: true, logs });
};

exports.managerDashboard = async (req, res) => {
  const reservations = await Reservation.find().populate('userId', 'username email').sort({ date: 1, startTime: 1 }).lean();

  // Ensure every known lab has a status doc (handles first run after this feature is added)
  await Promise.all(LABS.map(name => Lab.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true })));
  const labs = await Lab.find().sort({ name: 1 }).lean();

  res.render('manager_dashboard', {
    title: 'Lab Manager Dashboard',
    username: req.session.username,
    role: req.session.role,
    viewerRoleLabel: roleLabel(req.session.role),
    lastLoginNotice: req.session.lastLoginNotice,
    reservations,
    labs,
    css: ['/css/homepage.css'],
    js: ['/js/managerLabs.js']
  });
};

exports.blockLab = async (req, res) => {
  const labName = cleanString(req.body.lab);
  const reason = cleanString(req.body.reason || '');

  if (!LABS.includes(labName)) {
    await writeLog(req, 'VALIDATION', 'failure', { form: 'block-lab' });
    return res.status(400).json({ success: false, message: 'Invalid lab.' });
  }
  if (reason.length > 200) {
    return res.status(400).json({ success: false, message: 'Reason must be 200 characters or fewer.' });
  }

  try {
    const lab = await Lab.findOneAndUpdate(
      { name: labName },
      { isBlocked: true, blockedReason: reason, blockedBy: req.session.userId, blockedAt: new Date() },
      { upsert: true, new: true }
    );
    await writeLog(req, 'LAB_BLOCK', 'success', { lab: labName, reason });
    res.json({ success: true, lab });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
};

exports.unblockLab = async (req, res) => {
  const labName = cleanString(req.body.lab);

  if (!LABS.includes(labName)) {
    await writeLog(req, 'VALIDATION', 'failure', { form: 'unblock-lab' });
    return res.status(400).json({ success: false, message: 'Invalid lab.' });
  }

  try {
    const lab = await Lab.findOneAndUpdate(
      { name: labName },
      { isBlocked: false, blockedReason: '', blockedBy: null, blockedAt: null },
      { upsert: true, new: true }
    );
    await writeLog(req, 'LAB_UNBLOCK', 'success', { lab: labName });
    res.json({ success: true, lab });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
};