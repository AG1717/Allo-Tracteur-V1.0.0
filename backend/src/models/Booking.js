const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    // Références
    tractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tractor',
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Informations de contact (copiées pour historique)
    clientPhone: {
      type: String,
      required: true,
    },
    ownerPhone: {
      type: String,
      required: true,
    },
    // Dates de réservation (optionnelles - utilisées pour planification uniquement)
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    // Tarification
    prixParHectare: {
      type: Number,
      required: true,
    },
    nombreHectares: {
      type: Number,
      required: [true, 'Le nombre d\'hectares est requis'],
      min: [0.01, 'Le nombre d\'hectares doit être d\'au moins 0.01 ha'],
    },
    surfaceMetresCarres: {
      type: Number,
      // Optionnel - si fourni, sera converti en hectares (1 ha = 10000 m²)
    },
    nombreJours: {
      type: Number,
      // Optionnel - utilisé uniquement pour la planification, pas pour le calcul du prix
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    // Commission de la plateforme (10%)
    commission: {
      type: Number,
      default: 0,
    },
    ownerEarnings: {
      type: Number,
      default: 0,
    },
    // Statut
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed', 'in_progress'],
      default: 'pending',
    },
    // Paiement
    payment: {
      method: {
        type: String,
        enum: ['orange_money', 'wave', 'card', 'cash'],
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
      },
      transactionId: String,
      paidAt: Date,
      // Détails spécifiques selon le provider
      providerData: {
        type: mongoose.Schema.Types.Mixed,
      },
    },
    // Notes et motifs
    notes: {
      type: String,
      trim: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    // Avis client
    review: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, trim: true },
      createdAt: { type: Date },
    },
    // Historique des changements de statut
    statusHistory: [{
      status: { type: String },
      changedAt: { type: Date, default: Date.now },
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      note: { type: String },
    }],
  },
  {
    timestamps: true,
  }
);

// Index pour recherche rapide
bookingSchema.index({ client: 1, createdAt: -1 });
bookingSchema.index({ owner: 1, createdAt: -1 });
bookingSchema.index({ tractor: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });

// Middleware pour convertir m² en hectares si nécessaire
bookingSchema.pre('save', function (next) {
  // Si surfaceMetresCarres est fourni, convertir en hectares (1 ha = 10000 m²)
  if (this.surfaceMetresCarres && this.isModified('surfaceMetresCarres')) {
    this.nombreHectares = this.surfaceMetresCarres / 10000;
  }
  next();
});

// Middleware pour calculer les montants avant sauvegarde
bookingSchema.pre('save', function (next) {
  if (this.isModified('prixParHectare') || this.isModified('nombreHectares')) {
    this.totalPrice = this.prixParHectare * this.nombreHectares;
    this.commission = Math.round(this.totalPrice * 0.10); // 10% commission
    this.ownerEarnings = this.totalPrice - this.commission;
  }
  next();
});

// Middleware pour ajouter au statusHistory
bookingSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
    });
  }
  next();
});

// Méthode pour obtenir le nombre de jours
bookingSchema.methods.calculateDays = function () {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);
