const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/auth');
const { bookingLimiter } = require('../middleware/rateLimiter');

router.post('/select-seats', authenticateToken, bookingLimiter, bookingController.selectSeats);
router.post('/', authenticateToken, bookingLimiter, bookingController.createBooking);
router.get('/', authenticateToken, bookingController.getBookings);
router.get('/pnr/:pnr', bookingController.getBookingByPNR);
router.delete('/:bookingId', authenticateToken, bookingController.cancelBooking);

module.exports = router;
