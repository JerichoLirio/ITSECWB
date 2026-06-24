// controllers/authController.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const SALT_ROUNDS = 10;

// Security check for nosql inject
function sanitize(value) {
  if (typeof value === 'object' && value !== null) {
    for (let key in value) {
      if (key.startsWith('$')) delete value[key];
    }
  }
  return value;
}

exports.login = async (req, res) => {
  const username = sanitize(req.body.username);
  const password = sanitize(req.body.password);
  const remember = req.body.remember;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // Always set the session
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.email = user.email;
    req.session.role = user.role;

    // If already within a remember-me window, just return
    if (user.rememberMeUntil && user.rememberMeUntil > new Date()) {
      return res.json({ success: true, message: 'Login successful', user: { id: user._id, username: user.username, email: user.email } });
    }

    // Set a new remember-me window if requested
    if (remember) {
      const threeWeeks = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);
      req.session.cookie.maxAge = threeWeeks;
      await User.findByIdAndUpdate(user._id, { rememberMeUntil: threeWeeks });
    } else {
      req.session.cookie.expires = false; // session cookie, dies on browser close
    }

    res.json({ success: true, message: 'Login successful', user: { id: user._id, username: user.username, email: user.email } });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.register = async (req, res) => {
  const username = sanitize(req.body.username);
  const email = sanitize(req.body.email);
  const password = req.body.password;         
  const confirmPassword = req.body.confirmPassword; 

  if (!username || !password || !confirmPassword || !email) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'student' // default role on registration
    });

    res.status(201).json({ success: true, message: 'Registration successful', user: { id: newUser._id, username: newUser.username, email: newUser.email } });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error logging out' });
    res.json({ success: true, message: 'Logged out successfully' });
  });
};

exports.getUser = (req, res) => {
  if (req.session.userId) {
    res.json({ success: true, user: { id: req.session.userId, username: req.session.username, email: req.session.email } });
  } else {
    res.json({ success: true, user: null });
  }
};

// Ability for admin to create a technician
exports.createTechnician = async (req, res) => {

  if (req.session.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }

  const username = sanitize(req.body.username);
  const email = sanitize(req.body.email);
  const password = req.body.password;

  if (!username || !password || !email) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newTechnician = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'technician'
    });

    res.status(201).json({
      success: true,
      message: 'Technician account created successfully',
      user: { id: newTechnician._id, username: newTechnician.username, email: newTechnician.email }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
};