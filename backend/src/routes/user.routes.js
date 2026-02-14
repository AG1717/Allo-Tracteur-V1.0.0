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
const { auth, authorize } = require('../middleware/auth');

// Routes protégées
router.put('/profile', auth, updateProfile);

// Routes admin
router.get('/', auth, authorize('admin'), getUsers);
router.get('/stats', auth, authorize('admin'), getUserStats);
router.get('/:id', auth, authorize('admin'), getUser);
router.put('/:id/toggle-active', auth, authorize('admin'), toggleUserActive);
router.put('/:id/role', auth, authorize('admin'), updateUserRole);

module.exports = router;
