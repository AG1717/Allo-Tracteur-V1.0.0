const express = require('express');
const router = express.Router();
const {
  initiatePayment,
  confirmPayment,
  failPayment,
  getMyPayments,
  getReceivedPayments,
  getPaymentStats,
  getAdminPaymentStats
} = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth');

// Routes client
router.post('/', protect, initiatePayment);
router.get('/my-payments', protect, getMyPayments);

// Routes propriétaire
router.get('/received', protect, authorize('owner', 'admin'), getReceivedPayments);
router.get('/stats', protect, authorize('owner', 'admin'), getPaymentStats);

// Routes admin / webhook
router.put('/:id/confirm', protect, authorize('admin'), confirmPayment);
router.put('/:id/fail', protect, authorize('admin'), failPayment);
router.get('/admin/stats', protect, authorize('admin'), getAdminPaymentStats);

module.exports = router;
