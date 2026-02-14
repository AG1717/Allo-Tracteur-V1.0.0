const mongoose = require('mongoose');

const tractorSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom du tracteur est requis'],
      trim: true,
    },
    marque: {
      type: String,
      required: [true, 'La marque est requise'],
      trim: true,
    },
    modele: {
      type: String,
      required: [true, 'Le modèle est requis'],
      trim: true,
    },
    annee: {
      type: Number,
      required: [true, 'L\'année est requise'],
    },
    puissance: {
      type: Number,
      required: [true, 'La puissance est requise'],
    },
    description: {
      type: String,
      trim: true,
    },
    prixParHectare: {
      type: Number,
      required: [true, 'Le prix par hectare est requis'],
      min: [0, 'Le prix ne peut pas être négatif'],
    },
    // Localisation
    localisation: {
      adresse: { type: String, trim: true },
      ville: { type: String, trim: true },
      region: { type: String, required: true, trim: true },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
    },
    // Propriétaire
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Images
    images: [{
      url: { type: String, required: true },
      isPrimary: { type: Boolean, default: false },
    }],
    // Équipements inclus
    equipements: [{
      type: String,
      trim: true,
    }],
    // État et disponibilité
    etat: {
      type: String,
      enum: ['neuf', 'excellent', 'bon', 'moyen', 'a_renover'],
      default: 'bon',
    },
    disponible: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Statistiques
    stats: {
      totalBookings: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
      reviewCount: { type: Number, default: 0 },
    },
    // Périodes d'indisponibilité
    indisponibilites: [{
      startDate: { type: Date },
      endDate: { type: Date },
      reason: { type: String },
    }],
  },
  {
    timestamps: true,
  }
);

// Index pour recherche et filtrage
tractorSchema.index({ 'localisation.region': 1 });
tractorSchema.index({ prixParHectare: 1 });
tractorSchema.index({ disponible: 1 });
tractorSchema.index({ owner: 1 });
tractorSchema.index({ marque: 'text', modele: 'text', nom: 'text' });

// Virtual pour l'image principale
tractorSchema.virtual('imagePrincipale').get(function () {
  if (!this.images || this.images.length === 0) return null;
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0]?.url || null);
});

// Méthode pour vérifier la disponibilité sur une période
tractorSchema.methods.isAvailableForPeriod = function (startDate, endDate) {
  if (!this.disponible) return false;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return !this.indisponibilites.some(period => {
    const periodStart = new Date(period.startDate);
    const periodEnd = new Date(period.endDate);
    return (start <= periodEnd && end >= periodStart);
  });
};

tractorSchema.set('toJSON', { virtuals: true });
tractorSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Tractor', tractorSchema);
