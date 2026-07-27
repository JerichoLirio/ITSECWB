const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const profileController = require('../controllers/profileController');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/search', authMiddleware.requireLogin, searchController.search);
router.post('/account-profile/update', authMiddleware.requireLogin, profileController.updateProfile);
router.post('/account-profile/upload-picture', authMiddleware.requireLogin, profileController.uploadPicture);
router.delete('/account-profile/delete', authMiddleware.requireLogin, profileController.deleteAccount);
router.get('/admin/logs', authMiddleware.requireRole('admin'), adminController.logs);

module.exports = router;
