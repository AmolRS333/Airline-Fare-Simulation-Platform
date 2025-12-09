const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Admin-only routes
router.use(authenticateToken, requireRole(['admin']));

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/role', adminController.updateUserRole);

// Analytics
router.get('/analytics', adminController.getAnalytics);
router.get('/analytics/bookings', adminController.getBookingAnalytics);
router.get('/analytics/pricing', adminController.getPricingAnalytics);
router.get('/analytics/revenue', adminController.getRevenueAnalytics);

// Bookings
router.get('/bookings', adminController.getAllBookings);

module.exports = router;
