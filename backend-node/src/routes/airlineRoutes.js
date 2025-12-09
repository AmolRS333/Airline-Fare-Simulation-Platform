const express = require('express');
const router = express.Router();
const airlineController = require('../controllers/airlineController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', airlineController.getAirlines);
router.get('/:id', airlineController.getAirlineById);

// Admin only routes
router.post('/', authenticateToken, requireRole(['admin']), airlineController.createAirline);
router.put('/:id', authenticateToken, requireRole(['admin']), airlineController.updateAirline);
router.delete('/:id', authenticateToken, requireRole(['admin']), airlineController.deleteAirline);

module.exports = router;
