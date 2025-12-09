const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { searchLimiter } = require('../middleware/rateLimiter');

router.get('/search', searchLimiter, flightController.searchFlights);
router.get('/:id', flightController.getFlightById);
router.get('/:id/fare-history', flightController.getFareHistory);

// Admin only routes
router.post('/', authenticateToken, requireRole(['admin']), flightController.createFlight);
router.put('/:id', authenticateToken, requireRole(['admin']), flightController.updateFlight);
router.delete('/:id', authenticateToken, requireRole(['admin']), flightController.deleteFlight);

module.exports = router;
