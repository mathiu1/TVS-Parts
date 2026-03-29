const sanitize = require('mongo-sanitize');

const sanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }
  if (req.query) {
    // For Express 5, we mutate the query object directly since the property is a getter
    const sanitizedQuery = sanitize(req.query);
    Object.keys(req.query).forEach(key => {
      delete req.query[key];
    });
    Object.assign(req.query, sanitizedQuery);
  }
  next();
};

module.exports = sanitizeMiddleware;
