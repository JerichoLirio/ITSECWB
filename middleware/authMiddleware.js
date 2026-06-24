// Use this as reference for the folder structure: https://dev.to/nadim_ch0wdhury/how-to-create-an-authentication-authorization-feature-in-express-js-restful-api-ge8

/* Each page route already has their own session check so this is primarily for malicious users trying to call apis without authorization */
exports.requireLogin = (req, res, next ) => {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: 'Please login first' });
    }
    // Need a next() here otherwise the server just stalls for some reason
    next(); 
}