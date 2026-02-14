const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'new_booking',
        'booking_accepted',
        'booking_rejected',
        'booking_cancelled',
        'booking_completed',
        'payment_received',
        'payment_failed',
        'review_received',
        'system',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    // Destinataire
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Références optionnelles selon le type
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    tractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tractor',
    },
    // Informations supplémentaires pour affichage direct
    data: {
      clientName: String,
      clientPhone: String,
      ownerName: String,
      ownerPhone: String,
      tractorName: String,
      amount: Number,
    },
    // État
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour recherche rapide
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

// Middleware pour mettre à jour readAt
notificationSchema.pre('save', function (next) {
  if (this.isModified('read') && this.read && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
