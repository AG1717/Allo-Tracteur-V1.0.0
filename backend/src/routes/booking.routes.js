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
const { protect, authorize } = require('../middleware/auth');

// Routes client
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);

// Routes propriétaire
router.get('/requests', protect, authorize('owner', 'admin'), getReceivedRequests);
router.put('/:id/accept', protect, authorize('owner', 'admin'), acceptBooking);
router.put('/:id/reject', protect, authorize('owner', 'admin'), rejectBooking);
router.put('/:id/start', protect, authorize('owner', 'admin'), startBooking);
router.put('/:id/complete', protect, authorize('owner', 'admin'), completeBooking);

// Routes communes
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);

// Routes admin
router.get('/admin/stats', protect, authorize('admin'), getBookingStats);

module.exports = router;
