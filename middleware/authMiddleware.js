// 2.2.1 single site-wide access control component
const { writeLog } = require('../utils/security');

function wantsHtml(req) {
  return req.accepts('html') && !req.originalUrl.startsWith('/api');
}

// 2.1.2 deny by default if not logged in
exports.requireLogin = async (req, res, next) => {
  if (!req.session.userId) {
    await writeLog(req, 'ACCESS_CONTROL', 'failure', { reason: 'Not logged in' });
    if (wantsHtml(req)) return res.redirect('/login');
    return res.status(401).json({ success: false, message: 'Please login first' });
  }
  next();
};

// 2.2.2 fails securely, 2.4.7 logs access control failures
exports.requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.session.userId) {
      await writeLog(req, 'ACCESS_CONTROL', 'failure', { reason: 'Not logged in' });
      if (wantsHtml(req)) return res.redirect('/login');
      return res.status(401).json({ success: false, message: 'Please login first' });
    }

    if (!allowedRoles.includes(req.session.role)) {
      await writeLog(req, 'ACCESS_CONTROL', 'failure', {
        reason: 'Insufficient role',
        requiredRoles: allowedRoles,
        currentRole: req.session.role
      });
      if (wantsHtml(req)) return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to access this page.',
        css: ['/css/homepage.css']
      });
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  };
};
