const express = require('express');
const router = express.Router();
const { getUsers, getDashboardStats } = require('../controllers/adminController');
const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect, admin } = require('../middlewares/auth');

// Profile routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Admin routes
router.get('/', protect, admin, getUsers);
router.get('/dashboard', protect, admin, getDashboardStats);

module.exports = router;