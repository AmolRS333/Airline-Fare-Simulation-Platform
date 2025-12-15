const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Admin-only routes
router.use(authenticateToken, requireRole(['admin']));

// FLIGHT MANAGEMENT
router.get('/flights', adminController.getAllFlights);
router.get('/flights/:flightId', adminController.getFlightDetails);
router.put('/flights/:flightId', adminController.updateFlight);
router.delete('/flights/:flightId', adminController.deleteFlight);

// SEAT MANAGEMENT
router.get('/flights/:flightId/seats', adminController.getSeatMap);
router.put('/flights/:flightId/seats/:seat', adminController.updateSeatStatus);
router.get('/flights/:flightId/booked-seats', adminController.getBookedSeats);

// BOOKING MANAGEMENT
router.get('/bookings', adminController.getAllBookings);
router.get('/bookings/:bookingId', adminController.getBookingDetails);
router.put('/bookings/:bookingId/confirm', adminController.confirmBooking);
router.delete('/bookings/:bookingId', adminController.cancelBooking);
router.post('/bookings/:bookingId/refund', adminController.refundBooking);
router.get('/flights/:flightId/bookings', adminController.getBookingsByFlight);

// USER MANAGEMENT
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.put('/users/:userId/block', adminController.blockUser);
router.put('/users/:userId/unblock', adminController.unblockUser);
router.post('/users/:userId/reset-password', adminController.resetUserPassword);
router.delete('/users/:userId', adminController.deleteUser);

// REPORTS & ANALYTICS
router.get('/reports/dashboard', adminController.getDashboardStats);
router.get('/reports/bookings', adminController.getBookingReport);
router.get('/reports/revenue', adminController.getRevenueReport);
router.get('/reports/occupancy', adminController.getFlightOccupancyReport);
router.get('/reports/class-wise', adminController.getClassWiseReport);
router.get('/reports/trends', adminController.getTrendReport);

// SYSTEM HEALTH
router.get('/health', adminController.getSystemHealth);
router.get('/health/backend', adminController.getBackendStatus);
router.get('/health/python', adminController.getPythonPricingStatus);
router.get('/health/database', adminController.getDatabaseStatus);

// PRICING CONTROL
router.get('/pricing-rules', adminController.getPricingRules);
router.put('/pricing-rules', adminController.updatePricingRules);
router.get('/pricing/history', adminController.getPriceHistory);
router.get('/pricing/changelog', adminController.getPriceChangeLog);

// EMAIL & NOTIFICATIONS
router.get('/email-templates', adminController.getEmailTemplates);
router.put('/email-templates/:templateId', adminController.updateEmailTemplate);
router.post('/notifications/send', adminController.sendNotification);
router.post('/notifications/broadcast', adminController.broadcastNotification);

// PDF TEMPLATES
router.get('/pdf-templates', adminController.getPDFTemplates);
router.put('/pdf-templates', adminController.updatePDFTemplate);

// Legacy methods for backward compatibility
router.get('/analytics', adminController.getAnalytics);
router.get('/analytics/bookings', adminController.getBookingAnalytics);
router.get('/analytics/pricing', adminController.getPricingAnalytics);
router.get('/analytics/revenue', adminController.getRevenueAnalytics);
router.put('/users/:userId/role', adminController.updateUserRole);

module.exports = router;
