const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authMiddleware.requireLogin, authController.logout);
router.get('/user', authMiddleware.requireLogin, authController.getUser);
router.post('/forgot-password/question', authController.getResetQuestion);
router.post('/forgot-password/reset', authController.resetPassword);
router.post('/admin/users', authMiddleware.requireRole('admin'), authController.createUserByAdmin);
router.put('/admin/users', authMiddleware.requireRole('admin'), authController.editUserByAdmin);
router.delete('/admin/users', authMiddleware.requireRole('admin'), authController.deletePrivilegedUser);

module.exports = router;
