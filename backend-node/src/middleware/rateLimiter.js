const rateLimit = require('express-rate-limit');

// General rate limiter: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter: 5 requests per 15 minutes (for login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Search rate limiter: 50 requests per minute
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  message: 'Too many search requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Booking rate limiter: 10 bookings per minute
const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many booking requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  searchLimiter,
  bookingLimiter,
};
