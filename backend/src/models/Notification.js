const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'booking_request',
      'booking_confirmed',
      'booking_rejected',
      'booking_cancelled',
      'booking_started',
      'booking_completed',
      'payment_received',
      'payment_failed',
      'review_received',
      'tractor_approved',
      'tractor_rejected',
      'system_message',
      'promotion'
    ],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  message: {
    type: String,
    required: [true, 'Le message est requis'],
    maxlength: [500, 'Le message ne peut pas dépasser 500 caractères']
  },
  data: {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    tractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tractor' },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
    actionUrl: String,
    extra: mongoose.Schema.Types.Mixed
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  channels: {
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false }
  },
  sentVia: [{
    channel: { type: String, enum: ['push', 'email', 'sms'] },
    sentAt: Date,
    status: { type: String, enum: ['sent', 'delivered', 'failed'] }
  }]
}, {
  timestamps: true
});

// Index
NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });

// Méthode statique pour créer une notification
NotificationSchema.statics.createNotification = async function(userId, type, title, message, data = {}) {
  return this.create({
    user: userId,
    type,
    title,
    message,
    data
  });
};

// Méthode pour marquer comme lu
NotificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Notification', NotificationSchema);
