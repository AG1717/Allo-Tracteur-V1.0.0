const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
    },
    prenom: {
      type: String,
      required: [true, 'Le prénom est requis'],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Veuillez fournir un email valide'],
      default: undefined,
    },
    telephone: {
      type: String,
      required: [true, 'Le téléphone est requis'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
      select: false, // Ne pas inclure par défaut dans les requêtes
    },
    role: {
      type: String,
      enum: ['client', 'proprietaire', 'admin'],
      default: 'client',
    },
    adresse: {
      type: String,
      trim: true,
    },
    region: {
      type: String,
      trim: true,
    },
    coordinates: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
    avatar: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    // Pour les propriétaires
    entreprise: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Statistiques
    stats: {
      totalBookings: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 }, // Pour clients
      totalEarned: { type: Number, default: 0 }, // Pour propriétaires
      rating: { type: Number, default: 0 },
      reviewCount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Index pour recherche rapide
// Note: email a déjà un index via unique: true
userSchema.index({ telephone: 1 });
userSchema.index({ role: 1 });

// Hash le mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Alias pour compatibilité
userSchema.methods.matchPassword = async function (candidatePassword) {
  return await this.comparePassword(candidatePassword);
};

// Générer et signer un JWT token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { userId: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Méthode pour obtenir le nom complet
userSchema.methods.getFullName = function () {
  return `${this.prenom} ${this.nom}`;
};

// Virtual pour le nom complet
userSchema.virtual('fullName').get(function () {
  return `${this.prenom} ${this.nom}`;
});

// Toujours inclure les virtuals dans JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
