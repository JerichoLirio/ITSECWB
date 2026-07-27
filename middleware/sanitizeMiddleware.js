function sanitize(input) {
  if (Array.isArray(input)) {
    input.forEach(sanitize);
    return input;
  }
  if (input && typeof input === 'object') {
    for (const key of Object.keys(input)) {
      if (key.startsWith('$')) {
        delete input[key];
        continue;
      }
      sanitize(input[key]);
    }
  }
  return input;
}

exports.sanitize = sanitize;

exports.sanitizeRequest = (req, res, next) => {
  sanitize(req.body);
  sanitize(req.query);
  next();
};
