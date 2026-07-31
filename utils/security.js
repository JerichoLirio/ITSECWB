const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');

const PASSWORD_POLICY_TEXT = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';
const VALID_ROLES = ['student', 'lab_manager', 'admin'];
const LABS = ['G404A', 'G404B', 'V101'];
const SEATS = Array.from({ length: 32 }, (_, i) => `S${i + 1}`);
const TIMES = [
  '7:30','8:00','8:30','9:00','9:30','10:00','10:30','11:00','11:30','12:00',
  '1:00','1:30','2:00','2:30','3:00','3:30','4:00','4:30','5:00','5:30'
];

// 2.3.1 reject bad input instead of sanitizing it
function isPlainString(value) {
  return typeof value === 'string' && !value.includes('$') && !value.includes('{') && !value.includes('}');
}

function cleanString(value) {
  if (!isPlainString(value)) return null;
  return value.trim();
}

// 2.3.3 username length range
function isValidUsername(username) {
  return /^[A-Za-z0-9_]{3,30}$/.test(username || '');
}

function roleLabel(role) {
  if (role === 'admin') return 'Administrator';
  if (role === 'lab_manager') return 'Lab Manager';
  return 'Student';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '') && email.length <= 100;
}

// 2.1.5 2.1.6 password complexity and length policy
function isStrongPassword(password) {
  return typeof password === 'string' &&
    password.length >= 8 && password.length <= 72 &&
    /[a-z]/.test(password) && /[A-Z]/.test(password) &&
    /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
}

function isValidDate(dateText) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText || '')) return false;
  const date = new Date(dateText + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 7);
  return date >= today && date <= maxDate && date.getDay() !== 0;
}

// 2.3.2 validate lab/seat/time against allowed range
function isValidReservationInput({ lab, seat, date, startTime, endTime }) {
  return LABS.includes(lab) && SEATS.includes(seat) && isValidDate(date) &&
    TIMES.includes(startTime) && TIMES.includes(endTime) && TIMES.indexOf(endTime) === TIMES.indexOf(startTime) + 1;
}

async function writeLog(req, eventType, status, details = {}) {
  if (mongoose.connection.readyState !== 1) return;
  try {
    await AuditLog.create({
      eventType,
      status,
      username: req.session?.username || details.username || 'unknown',
      userId: req.session?.userId || null,
      role: req.session?.role || details.role || 'guest',
      ipAddress: req.ip,
      method: req.method,
      path: req.originalUrl,
      details
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
}

module.exports = {
  PASSWORD_POLICY_TEXT,
  VALID_ROLES,
  LABS,
  SEATS,
  TIMES,
  cleanString,
  isValidUsername,
  roleLabel,
  isValidEmail,
  isStrongPassword,
  isValidDate,
  isValidReservationInput,
  writeLog
};
