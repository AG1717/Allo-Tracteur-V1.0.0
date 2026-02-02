const express = require('express');
const router = express.Router();
const {
  createReview,
  getTractorReviews,
  getUserReviews,
  respondToReview,
  reportReview,
  hideReview
} = require('../controllers/review.controller');
const { protect, authorize } = require('../middleware/auth');

// Routes publiques
router.get('/tractor/:tractorId', getTractorReviews);
router.get('/user/:userId', getUserReviews);

// Routes protégées
router.post('/', protect, createReview);
router.put('/:id/respond', protect, respondToReview);
router.post('/:id/report', protect, reportReview);

// Routes admin
router.put('/:id/hide', protect, authorize('admin'), hideReview);

module.exports = router;
