const path = require('path');
const User = require('../models/User');
const Reservation = require('../models/Reservation'); 

exports.getHomepage = async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    try {
        res.render('homepage', {
            title: 'LRS - Home',
            username: req.session.username, // For the User Modal
            role: req.session.role,
            css: ['/css/homepage.css'],
            js: ['/js/homepage.js']
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

exports.getLogin = (req, res) => {
  if (req.session.userId) return res.redirect('/'); 
  res.render('login', { 
    title: 'LRS - Login',
    layout: 'main',
    css: ['/css/login.css'],
    js: ['/js/login.js']
  });
};

exports.getRegister = (req, res) => {
  res.render('register', { 
    title: 'LRS - Register',
    layout: 'main',
    css: ['/css/registration.css'],
    js:['/js/registration.js']
  });
};

// Getting the profile of the CURRENT user
exports.getAccountProfile = async (req, res) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).lean();

      // Way to load in reservations
      const reservations = await Reservation.find({ 
        userId: user._id,
      }).lean();

      res.render('account_profile', { 
        title: 'Account Profile',
        currentUser: user,   
        isOwnProfile: true, // Dont want to mess with profile_controller, for now just made a field and a separate function for OTHER users
        reservations: reservations.map(r => ({
          labName: r.lab,
          date: r.date,
          time: `${r.startTime} - ${r.endTime}`,
          seat: r.seat
        })),
        breadcrumbs: [
            { label: 'Home', url: '/home' },
            { label: 'Reservation', url: '/reservation' },
            { label: user.username, active: true }
        ],
        css: ['/css/account_profile.css'],
        js: [] 
      });
    } catch(err) {
      console.error(err);
      res.redirect('/');
    }
  } else {
    res.redirect('/login');
  }
};

// For OTHER users
exports.getProfile = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  const name = decodeURIComponent(req.params.name);
  try {
    const user = await User.findOne({ username: name }).lean();

    if (!user) return res.status(404).send('Profile not found');

    // Way to load in reservations
    const reservations = await Reservation.find({ 
      userId: user._id,
      anonymous: false  // dont put in anonymous reservations
    }).lean();

    res.render('account_profile', {
      title: `${user.username}'s Profile`,
      currentUser: user,
      isOwnProfile: false, // Should probably refactor this in MCO 3 for safety
      reservations: reservations.map(r => ({
        labName: r.lab,
        date: r.date,
        time: `${r.startTime} - ${r.endTime}`,
        seat: r.seat
      })),
      breadcrumbs: [
        { label: 'Home', url: '/home' },
        { label: 'Reservation', url: '/reservation' },
        { label: user.username, active: true }
      ],
      css: ['/css/account_profile.css'],
      js: []
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
};

exports.getReservation = (req, res) => {
    // This catches the :labName from the URL
    const selectedLab = req.params.labName;

    if (req.session.userId) {
        res.render('reservation', { 
            title: 'LRS - Reservation',
            labName: selectedLab, // Pass this to display the lab title
            username: req.session.username,
            role: req.session.role,
            userId: req.session.userId,
            breadcrumbs: [
                { label: 'Home', url: '/home' },
                { label: 'Reservation', active: true }
            ],
            css: ['/css/reservation.css'],
            js: ['/js/reservation.js'],

        });
    } else {
        res.redirect('/login');
    }
};



