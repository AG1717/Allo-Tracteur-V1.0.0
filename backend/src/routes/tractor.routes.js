const express = require('express');
const router = express.Router();
const {
  getTractors,
  getTractor,
  createTractor,
  updateTractor,
  deleteTractor,
  getMyTractors,
  toggleAvailability,
  approveTractor,
  rejectTractor,
  getTractorStats
} = require('../controllers/tractor.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Routes publiques
router.get('/', optionalAuth, getTractors);
router.get('/:id', optionalAuth, getTractor);

// Routes propriétaire
router.get('/owner/me', protect, authorize('owner', 'admin'), getMyTractors);
router.post('/', protect, authorize('owner', 'admin'), createTractor);
router.put('/:id', protect, authorize('owner', 'admin'), updateTractor);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteTractor);
router.put('/:id/availability', protect, authorize('owner'), toggleAvailability);

// Routes admin
router.get('/admin/stats', protect, authorize('admin'), getTractorStats);
router.put('/:id/approve', protect, authorize('admin'), approveTractor);
router.put('/:id/reject', protect, authorize('admin'), rejectTractor);

module.exports = router;
