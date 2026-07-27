const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Reservation = require('../models/Reservation');
const { PASSWORD_POLICY_TEXT, cleanString, isValidEmail, isStrongPassword, writeLog } = require('../utils/security');
const { isPasswordReused, ONE_DAY_MS } = require('./authController');

const SALT_ROUNDS = 10;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../public/images/profiles');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, req.session.userId + '-' + Date.now() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, and WEBP images are allowed.'));
    }
    cb(null, true);
  }
}).single('profilePicture');

exports.updateProfile = async (req, res) => {
  const email = cleanString(req.body.email);
  const description = cleanString(req.body.description || '');
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.password;
  const removeProfilePicture = req.body.removeProfilePicture;

  if (!email || !isValidEmail(email) || description.length > 300) {
    await writeLog(req, 'VALIDATION', 'failure', { form: 'profile-update' });
    return res.status(400).json({ success: false, message: 'Please check your email and bio length.' });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.email = email;
    user.description = description;
    if (removeProfilePicture) user.profilePicture = '';

    if (newPassword) {
      if (!currentPassword) {
        await writeLog(req, 'VALIDATION', 'failure', { form: 'password-change', reason: 'No current password' });
        return res.status(400).json({ success: false, message: 'Current password is required to change password.' });
      }
      const currentOk = await bcrypt.compare(currentPassword, user.password);
      if (!currentOk) {
        await writeLog(req, 'PASSWORD_CHANGE', 'failure', { reason: 'Reauthentication failed' });
        return res.status(403).json({ success: false, message: 'Current password is incorrect.' });
      }
      if (!isStrongPassword(newPassword)) {
        await writeLog(req, 'VALIDATION', 'failure', { form: 'password-change', reason: 'Weak password' });
        return res.status(400).json({ success: false, message: PASSWORD_POLICY_TEXT });
      }
      if (Date.now() - new Date(user.passwordChangedAt).getTime() < ONE_DAY_MS) {
        await writeLog(req, 'PASSWORD_CHANGE', 'failure', { reason: 'Password too new' });
        return res.status(400).json({ success: false, message: 'Password must be at least one day old before it can be changed again.' });
      }
      if (await isPasswordReused(user, newPassword)) {
        await writeLog(req, 'PASSWORD_CHANGE', 'failure', { reason: 'Password reuse' });
        return res.status(400).json({ success: false, message: 'New password cannot reuse a previous password.' });
      }
      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
      user.passwordHistory = [hashedPassword, user.password, ...(user.passwordHistory || [])].slice(0, 5);
      user.password = hashedPassword;
      user.passwordChangedAt = new Date();
      await writeLog(req, 'PASSWORD_CHANGE', 'success', { username: user.username });
    }

    await user.save();
    req.session.email = user.email;
    await writeLog(req, 'PROFILE_UPDATE', 'success', { username: user.username });
    return res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
};

exports.uploadPicture = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      await writeLog(req, 'VALIDATION', 'failure', { form: 'picture-upload', reason: err.message });
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    try {
      const filePath = '/images/profiles/' + req.file.filename;
      await User.findByIdAndUpdate(req.session.userId, { profilePicture: filePath });
      await writeLog(req, 'PROFILE_PICTURE', 'success', {});
      res.json({ success: true, filePath });
    } catch (dbErr) {
      console.error(dbErr);
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
  });
};

exports.deleteAccount = async (req, res) => {
  try {
    await Reservation.deleteMany({ userId: req.session.userId });
    await User.findByIdAndDelete(req.session.userId);
    await writeLog(req, 'ACCOUNT_DELETE', 'success', { deletedSelf: true });
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ success: false, message: 'Could not destroy session' });
      res.clearCookie('lrs.sid');
      return res.json({ success: true, message: 'Account deleted successfully' });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
};
