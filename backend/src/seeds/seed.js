/**
 * Script de seed pour la base de données Allo Tracteur
 * Usage: node src/seeds/seed.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Tractor = require('../models/Tractor');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/allotracteur');
  console.log('MongoDB connecté');
};

// Données utilisateurs
const users = [
  {
    nom: 'Diop',
    prenom: 'Mamadou',
    email: 'mamadou.diop@email.com',
    telephone: '+221771234567',
    password: 'password123',
    role: 'owner',
    isVerified: true,
    rating: 4.8,
    adresse: {
      ville: 'Dakar',
      region: 'Dakar'
    },
    bankInfo: {
      orangeMoney: '+221771234567',
      wave: '+221771234567'
    }
  },
  {
    nom: 'Ndiaye',
    prenom: 'Fatou',
    email: 'fatou.ndiaye@email.com',
    telephone: '+221776543210',
    password: 'password123',
    role: 'owner',
    isVerified: true,
    rating: 4.5,
    adresse: {
      ville: 'Thiès',
      region: 'Thiès'
    }
  },
  {
    nom: 'Sow',
    prenom: 'Ibrahima',
    email: 'ibrahima.sow@email.com',
    telephone: '+221778889999',
    password: 'password123',
    role: 'client',
    isVerified: true,
    rating: 4.2
  },
  {
    nom: 'Fall',
    prenom: 'Aminata',
    email: 'aminata.fall@email.com',
    telephone: '+221772223333',
    password: 'password123',
    role: 'client',
    isVerified: true
  },
  {
    nom: 'Admin',
    prenom: 'Système',
    email: 'admin@allotracteur.sn',
    telephone: '+221700000000',
    password: 'admin123',
    role: 'admin',
    isVerified: true
  }
];

// Données tracteurs
const tractorsData = [
  {
    name: 'John Deere 5050D',
    brand: 'John Deere',
    model: '5050D',
    type: 'TRACTOR',
    power: 50,
    year: 2020,
    description: 'Tracteur polyvalent idéal pour les petites et moyennes exploitations. Parfait pour le labour, le transport et diverses tâches agricoles.',
    features: ['Cabine climatisée', 'Direction assistée', '4 roues motrices', 'Attelage 3 points'],
    pricePerHour: 5000,
    pricePerDay: 35000,
    location: {
      type: 'Point',
      coordinates: [-17.4677, 14.7167],
      address: 'Route de Rufisque',
      ville: 'Dakar',
      region: 'Dakar'
    },
    isAvailable: true,
    isApproved: true,
    rating: 4.8,
    totalReviews: 12
  },
  {
    name: 'Massey Ferguson 290',
    brand: 'Massey Ferguson',
    model: '290',
    type: 'TRACTOR',
    power: 80,
    year: 2019,
    description: 'Tracteur robuste et puissant pour les grandes exploitations. Excellent pour les travaux lourds.',
    features: ['Moteur Perkins', '4x4', 'Hydraulique renforcé'],
    pricePerHour: 7000,
    pricePerDay: 45000,
    location: {
      type: 'Point',
      coordinates: [-16.9260, 14.7645],
      address: 'Zone agricole',
      ville: 'Thiès',
      region: 'Thiès'
    },
    isAvailable: true,
    isApproved: true,
    rating: 4.5,
    totalReviews: 8
  },
  {
    name: 'New Holland TD5',
    brand: 'New Holland',
    model: 'TD5',
    type: 'TRACTOR',
    power: 65,
    year: 2021,
    description: 'Tracteur moderne avec technologie avancée. Économique en carburant.',
    features: ['Économique', 'Cabine confort', 'Électronique embarquée'],
    pricePerHour: 6000,
    pricePerDay: 40000,
    location: {
      type: 'Point',
      coordinates: [-17.4380, 14.6928],
      address: 'Pikine',
      ville: 'Dakar',
      region: 'Dakar'
    },
    isAvailable: true,
    isApproved: true,
    rating: 4.9,
    totalReviews: 5
  },
  {
    name: 'Kubota L4508',
    brand: 'Kubota',
    model: 'L4508',
    type: 'TRACTOR',
    power: 45,
    year: 2022,
    description: 'Petit tracteur japonais fiable et économique. Idéal pour le maraîchage.',
    features: ['Compact', 'Économique', 'Fiable'],
    pricePerHour: 4000,
    pricePerDay: 28000,
    location: {
      type: 'Point',
      coordinates: [-16.0169, 16.4896],
      address: 'Zone agricole',
      ville: 'Saint-Louis',
      region: 'Saint-Louis'
    },
    isAvailable: true,
    isApproved: true,
    rating: 4.6,
    totalReviews: 3
  },
  {
    name: 'Case IH Farmall',
    brand: 'Case IH',
    model: 'Farmall 75A',
    type: 'TRACTOR',
    power: 75,
    year: 2020,
    description: 'Tracteur polyvalent américain. Grande fiabilité.',
    features: ['Transmission hydrostatique', 'Relevage avant', 'Chargeur frontal'],
    pricePerHour: 6500,
    pricePerDay: 42000,
    location: {
      type: 'Point',
      coordinates: [-14.6928, 16.0041],
      address: 'Zone agricole',
      ville: 'Kaolack',
      region: 'Kaolack'
    },
    isAvailable: false,
    isApproved: true,
    rating: 4.4,
    totalReviews: 7
  }
];

const seed = async () => {
  try {
    await connectDB();

    // Nettoyer la base
    console.log('Nettoyage de la base de données...');
    await User.deleteMany({});
    await Tractor.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});
    await Review.deleteMany({});

    // Créer les utilisateurs
    console.log('Création des utilisateurs...');
    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} utilisateurs créés`);

    // Récupérer les propriétaires
    const owners = createdUsers.filter(u => u.role === 'owner');

    // Créer les tracteurs
    console.log('Création des tracteurs...');
    const tractors = tractorsData.map((t, index) => ({
      ...t,
      owner: owners[index % owners.length]._id
    }));
    const createdTractors = await Tractor.create(tractors);
    console.log(`${createdTractors.length} tracteurs créés`);

    // Créer quelques réservations de test
    console.log('Création des réservations...');
    const clients = createdUsers.filter(u => u.role === 'client');

    const bookings = [
      {
        client: clients[0]._id,
        tractor: createdTractors[0]._id,
        owner: createdTractors[0].owner,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        duration: 3,
        status: 'pending',
        pricing: {
          basePrice: 105000,
          platformFee: 10500,
          ownerAmount: 94500,
          totalPrice: 105000
        }
      },
      {
        client: clients[1]._id,
        tractor: createdTractors[1]._id,
        owner: createdTractors[1].owner,
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        duration: 2,
        status: 'completed',
        pricing: {
          basePrice: 90000,
          platformFee: 9000,
          ownerAmount: 81000,
          totalPrice: 90000
        }
      }
    ];

    const createdBookings = await Booking.create(bookings);
    console.log(`${createdBookings.length} réservations créées`);

    console.log('\n✅ Seed terminé avec succès!');
    console.log('\nComptes de test:');
    console.log('- Admin: admin@allotracteur.sn / admin123');
    console.log('- Propriétaire: mamadou.diop@email.com / password123');
    console.log('- Client: ibrahima.sow@email.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Erreur lors du seed:', error);
    process.exit(1);
  }
};

seed();
