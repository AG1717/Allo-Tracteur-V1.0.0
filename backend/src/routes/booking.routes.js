const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getReceivedRequests,
  getBooking,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  startBooking,
  completeBooking,
  getBookingStats
} = require('../controllers/booking.controller');
const { auth, authorize } = require('../middleware/auth');

// Routes client
router.post('/', auth, createBooking);
router.get('/my-bookings', auth, getMyBookings);

// Routes propriétaire
router.get('/requests', auth, authorize('proprietaire', 'admin'), getReceivedRequests);

// Routes stats (propriétaire et admin) - AVANT /:id pour éviter le conflit
router.get('/admin/stats', auth, authorize('proprietaire', 'admin'), getBookingStats);

router.put('/:id/accept', auth, authorize('proprietaire', 'admin'), acceptBooking);
router.put('/:id/reject', auth, authorize('proprietaire', 'admin'), rejectBooking);
router.put('/:id/start', auth, authorize('proprietaire', 'admin'), startBooking);
router.put('/:id/complete', auth, authorize('proprietaire', 'admin'), completeBooking);

// Routes communes
router.get('/:id', auth, getBooking);
router.put('/:id/cancel', auth, cancelBooking);

module.exports = router;
