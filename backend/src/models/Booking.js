const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  reference: {
    type: String,
    unique: true,
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tractor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tractor',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'La date de début est requise']
  },
  endDate: {
    type: Date,
    required: [true, 'La date de fin est requise']
  },
  duration: {
    type: Number, // en jours
    required: true
  },
  durationType: {
    type: String,
    enum: ['hour', 'day'],
    default: 'day'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  pricing: {
    basePrice: { type: Number, required: true },
    platformFee: { type: Number, required: true }, // Commission plateforme (10%)
    ownerAmount: { type: Number, required: true }, // Montant propriétaire
    totalPrice: { type: Number, required: true }
  },
  location: {
    pickup: {
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    delivery: {
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    }
  },
  notes: {
    client: String,
    owner: String
  },
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    cancelledAt: Date,
    refundAmount: Number
  },
  // Historique des statuts
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String
  }],
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  hasReview: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Générer une référence unique avant sauvegarde
BookingSchema.pre('save', async function(next) {
  if (!this.reference) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.reference = `AT${year}${month}-${random}`;
  }
  next();
});

// Calculer la durée automatiquement
BookingSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    this.duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  next();
});

// Index pour les recherches
BookingSchema.index({ client: 1, status: 1 });
BookingSchema.index({ owner: 1, status: 1 });
BookingSchema.index({ tractor: 1, startDate: 1, endDate: 1 });
BookingSchema.index({ reference: 1 });

// Méthode pour ajouter un changement de statut à l'historique
BookingSchema.methods.addStatusChange = function(status, userId, note = '') {
  this.statusHistory.push({
    status,
    changedBy: userId,
    note
  });
  this.status = status;
};

module.exports = mongoose.model('Booking', BookingSchema);
