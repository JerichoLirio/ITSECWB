const bcrypt = require('bcryptjs');
const User = require('../models/User');
const {
  PASSWORD_POLICY_TEXT,
  cleanString,
  isValidUsername,
  isValidEmail,
  isStrongPassword,
  VALID_ROLES,
  writeLog
} = require('../utils/security');

const SALT_ROUNDS = 10;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 10;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

async function isPasswordReused(user, plainPassword) {
  const hashes = [user.password, ...(user.passwordHistory || [])];
  for (const hash of hashes) {
    if (await bcrypt.compare(plainPassword, hash)) return true;
  }
  return false;
}

exports.login = async (req, res) => {
  const username = cleanString(req.body.username);
  const password = req.body.password;
  const remember = req.body.remember;
  const genericMessage = 'Invalid username and/or password';

  if (!username || !password || !isValidUsername(username)) {
    await writeLog(req, 'LOGIN', 'failure', { username: username || 'blank', reason: 'Invalid login format' });
    return res.status(401).json({ success: false, message: genericMessage });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      await writeLog(req, 'LOGIN', 'failure', { username, reason: 'Account not found' });
      return res.status(401).json({ success: false, message: genericMessage });
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      await writeLog(req, 'LOGIN', 'failure', { username, reason: 'Account locked' });
      return res.status(423).json({ success: false, message: 'Account is temporarily locked. Please try again later.' });
    }

    const previousUse = user.lastLoginMessage || 'No previous login activity recorded.';
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      user.lastFailedLoginAt = new Date();
      user.lastLoginMessage = `Last login attempt failed on ${user.lastFailedLoginAt.toLocaleString()}.`;

      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME_MINUTES * 60 * 1000);
        user.failedLoginAttempts = 0;
        await writeLog(req, 'ACCOUNT_LOCKOUT', 'failure', { username, lockMinutes: LOCK_TIME_MINUTES });
      }

      await user.save();
      await writeLog(req, 'LOGIN', 'failure', { username, reason: 'Wrong credentials' });
      return res.status(401).json({ success: false, message: genericMessage });
    }

    const now = new Date();
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastSuccessfulLoginAt = now;
    user.lastLoginMessage = `Last successful login was on ${now.toLocaleString()}.`;

    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.email = user.email;
    req.session.role = user.role;
    req.session.lastLoginNotice = previousUse;

    if (remember) {
      const threeWeeks = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);
      req.session.cookie.maxAge = 21 * 24 * 60 * 60 * 1000;
      user.rememberMeUntil = threeWeeks;
    } else {
      req.session.cookie.expires = false;
      user.rememberMeUntil = null;
    }

    await user.save();
    await writeLog(req, 'LOGIN', 'success', { username: user.username, role: user.role });

    res.json({
      success: true,
      message: 'Login successful',
      lastLoginNotice: previousUse,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
};

exports.register = async (req, res) => {
  const username = cleanString(req.body.username);
  const email = cleanString(req.body.email);
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const securityQuestion = cleanString(req.body.securityQuestion);
  const securityAnswer = cleanString(req.body.securityAnswer);

  if (!username || !email || !password || !confirmPassword || !securityQuestion || !securityAnswer) {
    await writeLog(req, 'VALIDATION', 'failure', { form: 'register', reason: 'Missing fields' });
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  if (!isValidUsername(username)) {
    await writeLog(req, 'VALIDATION', 'failure', { form: 'register', field: 'username' });
    return res.status(400).json({ success: false, message: 'Username must be 3-30 letters, numbers, or underscores only.' });
  }
  if (!isValidEmail(email)) {
    await writeLog(req, 'VALIDATION', 'failure', { form: 'register', field: 'email' });
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }
  if (password !== confirmPassword) {
    await writeLog(req, 'VALIDATION', 'failure', { form: 'register', field: 'confirmPassword' });
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }
  if (!isStrongPassword(password)) {
    await writeLog(req, 'VALIDATION', 'failure', { form: 'register', field: 'password' });
    return res.status(400).json({ success: false, message: PASSWORD_POLICY_TEXT });
  }
  if (securityQuestion.length < 10 || securityQuestion.length > 120 || securityAnswer.length < 6 || securityAnswer.length > 80) {
    await writeLog(req, 'VALIDATION', 'failure', { form: 'register', field: 'securityQuestion' });
    return res.status(400).json({ success: false, message: 'Security question and answer must be specific enough.' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ success: false, message: 'Username or email already exists' });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const securityAnswerHash = await bcrypt.hash(securityAnswer.toLowerCase(), SALT_ROUNDS);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'student',
      securityQuestion,
      securityAnswerHash,
      passwordHistory: [hashedPassword]
    });

    await writeLog(req, 'REGISTER', 'success', { username: newUser.username });
    res.status(201).json({ success: true, message: 'Registration successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
};

exports.logout = async (req, res) => {
  await writeLog(req, 'LOGOUT', 'success', { username: req.session?.username });
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error logging out' });
    res.clearCookie('lrs.sid');
    res.json({ success: true, message: 'Logged out successfully' });
  });
};

exports.getUser = (req, res) => {
  if (req.session.userId) {
    return res.json({
      success: true,
      user: { id: req.session.userId, username: req.session.username, email: req.session.email, role: req.session.role }
    });
  }
  res.json({ success: true, user: null });
};

exports.createUserByAdmin = async (req, res) => {
  if (req.session.role !== 'admin') return res.status(403).json({ success: false, message: 'Access denied' });

  const username = cleanString(req.body.username);
  const email = cleanString(req.body.email);
  const password = req.body.password;
  const role = cleanString(req.body.role);
  const securityQuestion = cleanString(req.body.securityQuestion || 'What is your custom recovery phrase for this lab account?');
  const securityAnswer = cleanString(req.body.securityAnswer || 'TemporaryAnswer123!');

  if (!isValidUsername(username) || !isValidEmail(email) || !isStrongPassword(password) || !['admin', 'lab_manager'].includes(role)) {
    await writeLog(req, 'VALIDATION', 'failure', { form: 'admin-create-user' });
    return res.status(400).json({ success: false, message: 'Please check the account details and password policy.' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ success: false, message: 'Username or email already exists' });
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const securityAnswerHash = await bcrypt.hash(securityAnswer.toLowerCase(), SALT_ROUNDS);
    const user = await User.create({ username, email, password: hashedPassword, role, securityQuestion, securityAnswerHash, passwordHistory: [hashedPassword] });
    await writeLog(req, 'ADMIN_USER_CREATE', 'success', { createdUsername: username, role });
    res.status(201).json({ success: true, message: 'Account created', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
};

exports.changeRole = async (req, res) => {
  const userId = cleanString(req.body.userId);
  const role = cleanString(req.body.role);
  if (!userId || !['admin', 'lab_manager'].includes(role)) {
    await writeLog(req, 'VALIDATION', 'failure', { form: 'change-role' });
    return res.status(400).json({ success: false, message: 'Invalid role change request.' });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (String(user._id) === String(req.session.userId)) return res.status(400).json({ success: false, message: 'You cannot change your own role.' });
    user.role = role;
    await user.save();
    await writeLog(req, 'ADMIN_ROLE_CHANGE', 'success', { targetUser: user.username, newRole: role });
    res.json({ success: true, message: 'Role updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
};

exports.deletePrivilegedUser = async (req, res) => {
  const userId = cleanString(req.body.userId);
  if (!userId || String(userId) === String(req.session.userId)) return res.status(400).json({ success: false, message: 'Invalid delete request.' });
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!['admin', 'lab_manager'].includes(user.role)) return res.status(400).json({ success: false, message: 'Only admin and lab manager accounts can be deleted here.' });
    await user.deleteOne();
    await writeLog(req, 'ADMIN_USER_DELETE', 'success', { deletedUsername: user.username, role: user.role });
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
};

exports.getResetQuestion = async (req, res) => {
  const username = cleanString(req.body.username);
  if (!isValidUsername(username)) return res.status(400).json({ success: false, message: 'Invalid request' });
  const user = await User.findOne({ username }).lean();
  if (!user) return res.status(400).json({ success: false, message: 'Invalid request' });
  res.json({ success: true, question: user.securityQuestion || 'No question set.' });
};

exports.resetPassword = async (req, res) => {
  const username = cleanString(req.body.username);
  const answer = cleanString(req.body.securityAnswer);
  const newPassword = req.body.newPassword;
  if (!isValidUsername(username) || !answer || !isStrongPassword(newPassword)) {
    await writeLog(req, 'PASSWORD_RESET', 'failure', { username: username || 'invalid', reason: 'Validation failed' });
    return res.status(400).json({ success: false, message: 'Invalid reset information.' });
  }
  try {
    const user = await User.findOne({ username });
    if (!user || !user.securityAnswerHash) return res.status(400).json({ success: false, message: 'Invalid reset information.' });
    const ok = await bcrypt.compare(answer.toLowerCase(), user.securityAnswerHash);
    if (!ok) {
      await writeLog(req, 'PASSWORD_RESET', 'failure', { username, reason: 'Wrong answer' });
      return res.status(400).json({ success: false, message: 'Invalid reset information.' });
    }
    if (await isPasswordReused(user, newPassword)) return res.status(400).json({ success: false, message: 'New password cannot reuse an old password.' });
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.passwordHistory = [hashedPassword, user.password, ...(user.passwordHistory || [])].slice(0, 5);
    user.password = hashedPassword;
    // Forgot-password is a recovery path for a locked-out user, so it is intentionally
    // exempt from the 1-day password-age rule that applies to profileController.updateProfile.
    user.passwordChangedAt = new Date();
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();
    await writeLog(req, 'PASSWORD_RESET', 'success', { username });
    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
};

exports.isPasswordReused = isPasswordReused;
exports.ONE_DAY_MS = ONE_DAY_MS;
