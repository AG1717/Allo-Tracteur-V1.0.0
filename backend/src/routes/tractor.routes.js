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
  getTractorStats,
  uploadImages,
  deleteImage
} = require('../controllers/tractor.controller');
const { auth, authorize, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Routes publiques
router.get('/', optionalAuth, getTractors);

// Routes propriétaire (AVANT /:id pour éviter le conflit)
router.get('/owner/me', auth, authorize('proprietaire', 'admin'), getMyTractors);
router.post('/', auth, authorize('proprietaire', 'admin'), createTractor);

// Routes admin (AVANT /:id pour éviter le conflit)
router.get('/admin/stats', auth, authorize('admin'), getTractorStats);
router.put('/:id/approve', auth, authorize('admin'), approveTractor);
router.put('/:id/reject', auth, authorize('admin'), rejectTractor);

// Routes dynamiques /:id (APRÈS les routes statiques)
router.get('/:id', optionalAuth, getTractor);
router.put('/:id', auth, authorize('proprietaire', 'admin'), updateTractor);
router.delete('/:id', auth, authorize('proprietaire', 'admin'), deleteTractor);
router.put('/:id/availability', auth, authorize('proprietaire'), toggleAvailability);

// Upload d'images
router.post('/:id/images', auth, authorize('proprietaire', 'admin'), upload.array('images', 5), uploadImages);
router.delete('/:id/images/:imageId', auth, authorize('proprietaire', 'admin'), deleteImage);

module.exports = router;
