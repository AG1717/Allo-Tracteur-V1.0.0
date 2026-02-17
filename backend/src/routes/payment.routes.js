const express = require('express');
const router = express.Router();
const {
  initiatePayment,
  confirmPayment,
  failPayment,
  getMyPayments,
  getReceivedPayments,
  getPaymentStats,
  getAdminPaymentStats,
  initiateRefund,
  getPaymentDetails
} = require('../controllers/payment.controller');
const { auth, authorize, adminOnly } = require('../middleware/auth');

// Routes client
router.post('/', auth, initiatePayment);
router.get('/my-payments', auth, getMyPayments);

// Routes propriétaire
router.get('/received', auth, authorize('proprietaire', 'admin'), getReceivedPayments);
router.get('/stats', auth, authorize('proprietaire', 'admin'), getPaymentStats);

// Routes admin (statiques AVANT /:id)
router.get('/admin/stats', auth, adminOnly, getAdminPaymentStats);

// Routes dynamiques /:id (APRÈS les routes statiques)
router.get('/:id', auth, adminOnly, getPaymentDetails);
router.put('/:id/confirm', auth, adminOnly, confirmPayment);
router.put('/:id/fail', auth, adminOnly, failPayment);
router.post('/:id/refund', auth, adminOnly, initiateRefund);

module.exports = router;
