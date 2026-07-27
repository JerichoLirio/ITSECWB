const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/reservations', authMiddleware.requireLogin, reservationController.create);
router.get('/reservations', authMiddleware.requireLogin, reservationController.getByLabDateTime);
router.put('/reservations/:id', authMiddleware.requireLogin, reservationController.update);
router.delete('/reservations', authMiddleware.requireLogin, reservationController.remove);

module.exports = router;
