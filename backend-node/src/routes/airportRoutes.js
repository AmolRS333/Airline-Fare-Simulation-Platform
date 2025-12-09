const express = require('express');
const router = express.Router();
const airportController = require('../controllers/airportController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', airportController.getAirports);
router.get('/:id', airportController.getAirportById);

// Admin only routes
router.post('/', authenticateToken, requireRole(['admin']), airportController.createAirport);
router.put('/:id', authenticateToken, requireRole(['admin']), airportController.updateAirport);
router.delete('/:id', authenticateToken, requireRole(['admin']), airportController.deleteAirport);

module.exports = router;
