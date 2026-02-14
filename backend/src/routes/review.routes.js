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
const { auth, authorize } = require('../middleware/auth');

// Routes publiques
router.get('/tractor/:tractorId', getTractorReviews);
router.get('/user/:userId', getUserReviews);

// Routes protégées
router.post('/', auth, createReview);
router.put('/:id/respond', auth, respondToReview);
router.post('/:id/report', auth, reportReview);

// Routes admin
router.put('/:id/hide', auth, authorize('admin'), hideReview);

module.exports = router;
