const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  tractor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tractor',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['client_to_owner', 'owner_to_client'],
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'La note est requise'],
    min: [1, 'La note minimum est 1'],
    max: [5, 'La note maximum est 5']
  },
  comment: {
    type: String,
    maxlength: [500, 'Le commentaire ne peut pas dépasser 500 caractères']
  },
  // Notes détaillées (optionnel)
  detailedRatings: {
    condition: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    punctuality: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 }
  },
  response: {
    content: String,
    respondedAt: Date
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  reportedBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    reportedAt: Date
  }]
}, {
  timestamps: true
});

// Index
ReviewSchema.index({ tractor: 1 });
ReviewSchema.index({ reviewer: 1 });
ReviewSchema.index({ reviewedUser: 1 });
ReviewSchema.index({ booking: 1 }, { unique: true });

// Après sauvegarde, mettre à jour la note moyenne du tracteur et de l'utilisateur
ReviewSchema.post('save', async function() {
  const Tractor = mongoose.model('Tractor');
  const User = mongoose.model('User');

  // Mettre à jour la note du tracteur
  const tractorReviews = await this.constructor.find({
    tractor: this.tractor,
    isVisible: true
  });

  if (tractorReviews.length > 0) {
    const avgRating = tractorReviews.reduce((sum, r) => sum + r.rating, 0) / tractorReviews.length;
    await Tractor.findByIdAndUpdate(this.tractor, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: tractorReviews.length
    });
  }

  // Mettre à jour la note de l'utilisateur évalué
  const userReviews = await this.constructor.find({
    reviewedUser: this.reviewedUser,
    isVisible: true
  });

  if (userReviews.length > 0) {
    const avgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
    await User.findByIdAndUpdate(this.reviewedUser, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: userReviews.length
    });
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
