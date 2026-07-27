const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Reservation = require('../models/Reservation');
const { cleanString, roleLabel } = require('../utils/security');

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
  res.render('manager_dashboard', {
    title: 'Lab Manager Dashboard',
    username: req.session.username,
    role: req.session.role,
    viewerRoleLabel: roleLabel(req.session.role),
    lastLoginNotice: req.session.lastLoginNotice,
    reservations,
    css: ['/css/homepage.css'],
    js: []
  });
};
