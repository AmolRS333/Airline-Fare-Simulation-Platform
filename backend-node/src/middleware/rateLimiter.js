const rateLimit = require('express-rate-limit');

// General rate limiter: 200 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: false,
});

// Auth rate limiter: 5 requests per 15 minutes (for login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: false,
});

// Search rate limiter: 100 requests per minute (allows polling)
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many search requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: false,
});

// Booking rate limiter: 30 requests per minute (allows polling)
const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many booking requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  searchLimiter,
  bookingLimiter,
};
