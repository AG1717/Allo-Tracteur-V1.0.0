const mongoose = require('mongoose');

const TractorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du tracteur est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  brand: {
    type: String,
    required: [true, 'La marque est requise'],
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['TRACTOR', 'HARVESTER', 'PLOUGH', 'SEEDER', 'SPRAYER', 'OTHER'],
    default: 'TRACTOR'
  },
  power: {
    type: Number,
    required: [true, 'La puissance (CV) est requise'],
    min: [1, 'La puissance doit être positive']
  },
  year: {
    type: Number,
    min: [1950, 'Année invalide'],
    max: [new Date().getFullYear() + 1, 'Année invalide']
  },
  description: {
    type: String,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  features: [{
    type: String
  }],
  images: [{
    url: String,
    isMain: { type: Boolean, default: false }
  }],
  pricePerHour: {
    type: Number,
    required: [true, 'Le prix par heure est requis'],
    min: [0, 'Le prix doit être positif']
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Le prix par jour est requis'],
    min: [0, 'Le prix doit être positif']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: String,
    ville: String,
    region: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  // Disponibilités (jours bloqués)
  blockedDates: [{
    startDate: Date,
    endDate: Date,
    reason: String
  }],
  // Statistiques
  stats: {
    totalEarnings: { type: Number, default: 0 },
    totalHoursRented: { type: Number, default: 0 },
    totalDaysRented: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index géospatial pour la recherche par proximité
TractorSchema.index({ location: '2dsphere' });

// Index pour la recherche
TractorSchema.index({ name: 'text', brand: 'text', description: 'text' });

// Méthode statique pour rechercher des tracteurs à proximité
TractorSchema.statics.findNearby = function(longitude, latitude, maxDistance = 50000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // en mètres
      }
    },
    isAvailable: true,
    isApproved: true
  });
};

// Méthode pour vérifier la disponibilité pour une période
TractorSchema.methods.isAvailableForPeriod = function(startDate, endDate) {
  if (!this.isAvailable || !this.isApproved) return false;

  const start = new Date(startDate);
  const end = new Date(endDate);

  for (const blocked of this.blockedDates) {
    const blockedStart = new Date(blocked.startDate);
    const blockedEnd = new Date(blocked.endDate);

    // Vérifier si les périodes se chevauchent
    if (start <= blockedEnd && end >= blockedStart) {
      return false;
    }
  }

  return true;
};

module.exports = mongoose.model('Tractor', TractorSchema);
