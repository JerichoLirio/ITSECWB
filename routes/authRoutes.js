const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.get('/user', authController.getUser);
router.post('/create-technician', authMiddleware.requireLogin, authController.createTechnician); 

module.exports = router;
