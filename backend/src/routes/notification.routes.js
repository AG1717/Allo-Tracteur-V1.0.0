const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  sendSystemNotification,
  broadcastNotification
} = require('../controllers/notification.controller');
const { protect, authorize } = require('../middleware/auth');

// Routes utilisateur
router.get('/', protect, getMyNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);
router.delete('/:id', protect, deleteNotification);
router.delete('/clear-read', protect, clearReadNotifications);

// Routes admin
router.post('/system', protect, authorize('admin'), sendSystemNotification);
router.post('/broadcast', protect, authorize('admin'), broadcastNotification);

module.exports = router;
