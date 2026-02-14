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
    role: 'proprietaire',
    adresse: 'Route de Rufisque, Dakar',
    region: 'Dakar',
    isVerified: true,
    isActive: true,
    entreprise: 'Agri Services Diop',
    description: 'Spécialiste en location de matériel agricole'
  },
  {
    nom: 'Ndiaye',
    prenom: 'Fatou',
    email: 'fatou.ndiaye@email.com',
    telephone: '+221776543210',
    password: 'password123',
    role: 'proprietaire',
    adresse: 'Zone agricole, Thiès',
    region: 'Thiès',
    isVerified: true,
    isActive: true,
    entreprise: 'Tracteurs Ndiaye',
    description: 'Location de tracteurs depuis 2015'
  },
  {
    nom: 'Sow',
    prenom: 'Ibrahima',
    email: 'ibrahima.sow@email.com',
    telephone: '+221778889999',
    password: 'password123',
    role: 'client',
    adresse: 'Parcelles Assainies, Dakar',
    region: 'Dakar',
    isVerified: true,
    isActive: true
  },
  {
    nom: 'Fall',
    prenom: 'Aminata',
    email: 'aminata.fall@email.com',
    telephone: '+221772223333',
    password: 'password123',
    role: 'client',
    adresse: 'Mbour',
    region: 'Thiès',
    isVerified: true,
    isActive: true
  },
  {
    nom: 'Admin',
    prenom: 'Système',
    email: 'admin@allotracteur.sn',
    telephone: '+221700000000',
    password: 'admin123',
    role: 'admin',
    adresse: 'Siège Allo Tracteur',
    region: 'Dakar',
    isVerified: true,
    isActive: true
  }
];

// Données tracteurs
const tractorsData = [
  {
    nom: 'John Deere 5050D',
    marque: 'John Deere',
    modele: '5050D',
    annee: 2020,
    puissance: 50,
    description: 'Tracteur polyvalent idéal pour les petites et moyennes exploitations. Parfait pour le labour, le transport et diverses tâches agricoles.',
    prixParHectare: 35000,
    localisation: {
      adresse: 'Route de Rufisque',
      ville: 'Dakar',
      region: 'Dakar',
      coordinates: {
        latitude: 14.7167,
        longitude: -17.4677
      }
    },
    images: [
      { url: 'https://example.com/john-deere-5050d.jpg', isPrimary: true }
    ],
    equipements: ['Cabine climatisée', 'Direction assistée', '4 roues motrices', 'Attelage 3 points'],
    etat: 'excellent',
    disponible: true,
    isActive: true
  },
  {
    nom: 'Massey Ferguson 290',
    marque: 'Massey Ferguson',
    modele: '290',
    annee: 2019,
    puissance: 80,
    description: 'Tracteur robuste et puissant pour les grandes exploitations. Excellent pour les travaux lourds.',
    prixParHectare: 45000,
    localisation: {
      adresse: 'Zone agricole',
      ville: 'Thiès',
      region: 'Thiès',
      coordinates: { latitude: 14.7645, longitude: -16.9260 }
    },
    images: [{ url: 'https://example.com/massey-290.jpg', isPrimary: true }],
    equipements: ['Moteur Perkins', '4x4', 'Hydraulique renforcé'],
    etat: 'bon',
    disponible: true,
    isActive: true
  },
  {
    nom: 'New Holland TD5',
    marque: 'New Holland',
    modele: 'TD5',
    annee: 2021,
    puissance: 65,
    description: 'Tracteur moderne avec technologie avancée. Économique en carburant.',
    prixParHectare: 40000,
    localisation: {
      adresse: 'Pikine',
      ville: 'Dakar',
      region: 'Dakar',
      coordinates: { latitude: 14.6928, longitude: -17.4380 }
    },
    images: [{ url: 'https://example.com/new-holland-td5.jpg', isPrimary: true }],
    equipements: ['Économique', 'Cabine confort', 'Électronique embarquée'],
    etat: 'excellent',
    disponible: true,
    isActive: true
  },
  {
    nom: 'Kubota L4508',
    marque: 'Kubota',
    modele: 'L4508',
    annee: 2022,
    puissance: 45,
    description: 'Petit tracteur japonais fiable et économique. Idéal pour le maraîchage.',
    prixParHectare: 28000,
    localisation: {
      adresse: 'Zone agricole',
      ville: 'Saint-Louis',
      region: 'Saint-Louis',
      coordinates: { latitude: 16.4896, longitude: -16.0169 }
    },
    images: [{ url: 'https://example.com/kubota-l4508.jpg', isPrimary: true }],
    equipements: ['Compact', 'Économique', 'Fiable'],
    etat: 'bon',
    disponible: true,
    isActive: true
  },
  {
    nom: 'Case IH Farmall',
    marque: 'Case IH',
    modele: 'Farmall 75A',
    annee: 2020,
    puissance: 75,
    description: 'Tracteur polyvalent américain. Grande fiabilité.',
    prixParHectare: 42000,
    localisation: {
      adresse: 'Zone agricole',
      ville: 'Kaolack',
      region: 'Kaolack',
      coordinates: { latitude: 16.0041, longitude: -14.6928 }
    },
    images: [{ url: 'https://example.com/case-ih-farmall.jpg', isPrimary: true }],
    equipements: ['Transmission hydrostatique', 'Relevage avant', 'Chargeur frontal'],
    etat: 'bon',
    disponible: false,
    isActive: true
  }
];

const seed = async () => {
  try {
    await connectDB();

    // Nettoyer complètement la base
    console.log('Nettoyage de la base de données...');
    await mongoose.connection.dropDatabase();
    console.log('Base de données supprimée et recréée');

    // Créer les utilisateurs
    console.log('Création des utilisateurs...');
    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} utilisateurs créés`);

    // Récupérer les propriétaires
    const owners = createdUsers.filter(u => u.role === 'proprietaire');

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
        clientPhone: clients[0].telephone,
        ownerPhone: owners[0].telephone,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        prixParHectare: 35000,
        nombreJours: 3,
        totalPrice: 105000,
        commission: 10500,
        ownerEarnings: 94500,
        status: 'pending',
        payment: {
          method: 'orange_money',
          status: 'pending'
        }
      },
      {
        client: clients[1]._id,
        tractor: createdTractors[1]._id,
        owner: createdTractors[1].owner,
        clientPhone: clients[1].telephone,
        ownerPhone: owners[1 % owners.length].telephone,
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        prixParHectare: 45000,
        nombreJours: 2,
        totalPrice: 90000,
        commission: 9000,
        ownerEarnings: 81000,
        status: 'completed',
        payment: {
          method: 'wave',
          status: 'completed',
          paidAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
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
