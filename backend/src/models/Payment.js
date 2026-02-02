const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  reference: {
    type: String,
    unique: true,
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Le montant est requis'],
    min: [0, 'Le montant doit être positif']
  },
  platformFee: {
    type: Number,
    required: true,
    min: 0
  },
  ownerAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'XOF'
  },
  method: {
    type: String,
    enum: ['orange_money', 'wave', 'cash', 'bank_transfer'],
    required: [true, 'La méthode de paiement est requise']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  // Informations du provider de paiement
  providerData: {
    transactionId: String,
    providerReference: String,
    phoneNumber: String,
    responseCode: String,
    responseMessage: String
  },
  // Informations de remboursement
  refund: {
    amount: Number,
    reason: String,
    refundedAt: Date,
    refundReference: String
  },
  // Historique des statuts
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    note: String
  }],
  metadata: {
    type: Map,
    of: String
  },
  completedAt: Date,
  failedAt: Date
}, {
  timestamps: true
});

// Générer une référence unique avant sauvegarde
PaymentSchema.pre('save', async function(next) {
  if (!this.reference) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    this.reference = `PAY${year}${month}-${random}`;
  }
  next();
});

// Index
PaymentSchema.index({ booking: 1 });
PaymentSchema.index({ payer: 1 });
PaymentSchema.index({ recipient: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ reference: 1 });

// Méthode pour marquer comme complété
PaymentSchema.methods.markAsCompleted = function(providerData = {}) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.providerData = { ...this.providerData, ...providerData };
  this.statusHistory.push({
    status: 'completed',
    note: 'Paiement confirmé'
  });
};

// Méthode pour marquer comme échoué
PaymentSchema.methods.markAsFailed = function(reason = '') {
  this.status = 'failed';
  this.failedAt = new Date();
  this.statusHistory.push({
    status: 'failed',
    note: reason
  });
};

module.exports = mongoose.model('Payment', PaymentSchema);
