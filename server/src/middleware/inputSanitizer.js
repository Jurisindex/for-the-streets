const validator = require('validator');

function sanitizeString(str) {
  return validator.escape(str);
}

function sanitizeUrl(url) {
  return validator.isURL(url) ? url : '';
}

function inputSanitizer(req, res, next) {
  for (const key in req.body) {
    if (typeof req.body[key] === 'string') {
      if (key === 'pic_url') {
        req.body[key] = sanitizeUrl(req.body[key]);
      } else {
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }
  next();
}

module.exports = inputSanitizer;

// const expressSanitizer = require('express-sanitizer');

// function inputSanitizer(req, res, next) {
//   const sanitize = expressSanitizer();
//   req.sanitize = sanitize;
  
//   for (const key in req.body) {
//     if (typeof req.body[key] === 'string') {
//       req.body[key] = req.sanitize(req.body[key]);
//     }
//   }
//   next();
// }

// module.exports = inputSanitizer;