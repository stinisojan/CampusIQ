const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 chat queries per minute
  message: {
    success: false,
    message: 'Too many chat requests. Please wait a moment before sending another query.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  message: {
    success: false,
    message: 'Rate limit exceeded, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, chatLimiter, apiLimiter };
