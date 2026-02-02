const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateProfile,
  toggleUserActive,
  updateUserRole,
  getUserStats
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth');

// Routes protégées
router.put('/profile', protect, updateProfile);

// Routes admin
router.get('/', protect, authorize('admin'), getUsers);
router.get('/stats', protect, authorize('admin'), getUserStats);
router.get('/:id', protect, authorize('admin'), getUser);
router.put('/:id/toggle-active', protect, authorize('admin'), toggleUserActive);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);

module.exports = router;
