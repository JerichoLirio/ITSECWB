const User = require('../models/User');
const Reservation = require('../models/Reservation');

function roleLabel(role) {
  if (role === 'admin') return 'Administrator';
  if (role === 'lab_manager') return 'Lab Manager';
  return 'Student';
}

exports.getHomepage = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.render('homepage', {
    title: 'LRS - Home',
    username: req.session.username,
    role: req.session.role,
    roleLabel: roleLabel(req.session.role),
    lastLoginNotice: req.session.lastLoginNotice,
    css: ['/css/homepage.css'],
    js: ['/js/homepage.js']
  });
};

exports.getLogin = (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('login', { title: 'LRS - Login', layout: 'main', css: ['/css/login.css'], js: ['/js/login.js'] });
};

exports.getRegister = (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('register', { title: 'LRS - Register', layout: 'main', css: ['/css/registration.css'], js: ['/js/registration.js'] });
};

exports.getForgotPassword = (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('forgot_password', { title: 'LRS - Password Reset', layout: 'main', css: ['/css/registration.css'], js: ['/js/forgot_password.js'] });
};

exports.getAccountProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).lean();
    const reservations = await Reservation.find({ userId: user._id }).lean();
    res.render('account_profile', {
      title: 'Account Profile',
      username: req.session.username,
      role: req.session.role,
      currentUser: user,
      roleLabel: roleLabel(user.role),
      isOwnProfile: true,
      reservations: reservations.map(r => ({ labName: r.lab, date: r.date, time: `${r.startTime} - ${r.endTime}`, seat: r.seat })),
      breadcrumbs: [{ label: 'Home', url: '/home' }, { label: user.username, active: true }],
      css: ['/css/account_profile.css'],
      js: []
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
};

exports.getProfile = async (req, res) => {
  const name = decodeURIComponent(req.params.name);
  try {
    const user = await User.findOne({ username: name }).lean();
    if (!user) return res.status(404).render('error', { title: 'Not Found', message: 'Profile not found.' });
    const reservations = await Reservation.find({ userId: user._id, anonymous: false }).lean();
    res.render('account_profile', {
      title: `${user.username}'s Profile`,
      username: req.session.username,
      role: req.session.role,
      currentUser: user,
      roleLabel: roleLabel(user.role),
      isOwnProfile: false,
      reservations: reservations.map(r => ({ labName: r.lab, date: r.date, time: `${r.startTime} - ${r.endTime}`, seat: r.seat })),
      breadcrumbs: [{ label: 'Home', url: '/home' }, { label: 'Reservation', url: '/reservation' }, { label: user.username, active: true }],
      css: ['/css/account_profile.css'],
      js: []
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
};

exports.getReservation = (req, res) => {
  const selectedLab = req.params.labName;
  res.render('reservation', {
    title: 'LRS - Reservation',
    labName: selectedLab,
    username: req.session.username,
    role: req.session.role,
    userId: req.session.userId,
    breadcrumbs: [{ label: 'Home', url: '/home' }, { label: 'Reservation', active: true }],
    css: ['/css/reservation.css'],
    js: ['/js/reservation.js']
  });
};
