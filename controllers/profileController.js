const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Reservation = require('../models/Reservation');
const MIN_PASSWORD_LENGTH = 3;

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../public/images/profiles');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, req.session.userId + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage }).single('profilePicture');

exports.updateProfile = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'You must be logged in to update your profile'
    });
  }

  const email = sanitize(req.body.email);
  const password = req.body.password; // not used in query, safe as-is
  const description = sanitize(req.body.description);
  const removeProfilePicture = req.body.removeProfilePicture;

  try {
    const updateData = {};

    // Back-end email validation
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }
      updateData.email = email;
    }

    // Back-end password validation
    if (password) {
      if (password.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({ success: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
      }
      updateData.password = await bcrypt.hash(password, SALT_ROUNDS);
    }
    
    if (description !== undefined) updateData.description = description;
    if (removeProfilePicture) updateData.profilePicture = '';

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
    }

    const updatedUser = await User.findByIdAndUpdate(req.session.userId, updateData, { new: true });

    if (updatedUser.email)
      req.session.email = updatedUser.email;

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        email: updatedUser.email
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

exports.uploadPicture = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Upload failed', error: err });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    try {
      const filePath = '/images/profiles/' + req.file.filename;
      await User.findByIdAndUpdate(req.session.userId, { profilePicture: filePath });
      res.json({ success: true, filePath: filePath });
    } catch (dbErr) {
      res.status(500).json({ success: false, message: 'Database error', error: dbErr });
    }
  });
};

exports.deleteAccount = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    await Reservation.deleteMany({ userId: req.session.userId });
    await User.findByIdAndDelete(req.session.userId);
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Could not destroy session' });
      }
      res.clearCookie('connect.sid');
      return res.json({ success: true, message: 'Account deleted successfully' });
    });
  } catch (err) {
    console.error('Error deleting account:', err);
    return res.status(500).json({ success: false, message: 'Server error deleting account' });
  }
};
