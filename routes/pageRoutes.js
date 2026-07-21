const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware.requireLogin, pageController.getHomepage);
router.get('/home', authMiddleware.requireLogin, pageController.getHomepage);
router.get('/login', pageController.getLogin);
router.get('/register', pageController.getRegister);
router.get('/forgot-password', pageController.getForgotPassword);
router.get('/account-profile', authMiddleware.requireLogin, pageController.getAccountProfile);
router.get('/reservation', authMiddleware.requireLogin, pageController.getReservation);
router.get('/reservation/:labName', authMiddleware.requireLogin, pageController.getReservation);
router.get('/profile/:name', authMiddleware.requireLogin, pageController.getProfile);
router.get('/admin', authMiddleware.requireRole('admin'), adminController.dashboard);
router.get('/manager', authMiddleware.requireRole('admin', 'lab_manager'), adminController.managerDashboard);

module.exports = router;
