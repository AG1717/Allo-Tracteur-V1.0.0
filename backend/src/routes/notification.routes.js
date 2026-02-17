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
const { auth, authorize } = require('../middleware/auth');

// Routes utilisateur
router.get('/', auth, getMyNotifications);
router.put('/read-all', auth, markAllAsRead);
router.put('/:id/read', auth, markAsRead);
router.delete('/clear-read', auth, clearReadNotifications);
router.delete('/:id', auth, deleteNotification);

// Routes admin
router.post('/system', auth, authorize('admin'), sendSystemNotification);
router.post('/broadcast', auth, authorize('admin'), broadcastNotification);

module.exports = router;
