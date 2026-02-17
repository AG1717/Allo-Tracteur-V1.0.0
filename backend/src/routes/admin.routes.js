const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const Tractor = require('../models/Tractor');
const Payment = require('../models/Payment');
const { protect, adminOnly } = require('../middleware/auth');

/**
 * Toutes les routes admin nécessitent une authentification admin
 */

// ==================== STATISTIQUES ====================

/**
 * GET /api/admin/stats
 * Récupérer les statistiques du dashboard
 */
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    // Compter les utilisateurs
    const totalUsers = await User.countDocuments();
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalOwners = await User.countDocuments({ role: 'proprietaire' });

    // Compter les tracteurs
    const totalTractors = await Tractor.countDocuments();
    const availableTractors = await Tractor.countDocuments({
      disponible: true,
      isApproved: true,
      isActive: true,
    });
    const pendingApprovals = await Tractor.countDocuments({
      isApproved: false,
      isActive: true,
    });

    // Compter les réservations
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({
      status: { $in: ['pending', 'accepted', 'in_progress'] },
    });
    const completedBookings = await Booking.countDocuments({
      status: 'completed',
    });

    // Calculer le revenu du mois en cours
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyBookings = await Booking.find({
      status: 'completed',
      'payment.status': 'completed',
      createdAt: { $gte: startOfMonth },
    });

    const monthlyRevenue = monthlyBookings.reduce((sum, booking) => sum + booking.commission, 0);

    // Calculer la croissance (mois précédent)
    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const lastMonthBookings = await Booking.find({
      status: 'completed',
      'payment.status': 'completed',
      createdAt: {
        $gte: startOfLastMonth,
        $lt: startOfMonth,
      },
    });

    const lastMonthRevenue = lastMonthBookings.reduce((sum, booking) => sum + booking.commission, 0);
    const revenueGrowth = lastMonthRevenue > 0
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalClients,
        totalOwners,
        totalTractors,
        availableTractors,
        pendingApprovals,
        totalBookings,
        activeBookings,
        completedBookings,
        monthlyRevenue: Math.round(monthlyRevenue),
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Erreur stats admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
    });
  }
});

/**
 * GET /api/admin/revenue-by-month
 * Récupérer le revenu par mois (tous les 12 mois de l'année en cours)
 */
router.get('/revenue-by-month', protect, adminOnly, async (req, res) => {
  try {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const revenueByMonth = [];
    const currentYear = new Date().getFullYear();

    // Tous les 12 mois de l'année en cours (Janvier à Décembre)
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const startOfMonth = new Date(currentYear, monthIndex, 1);
      const endOfMonth = new Date(currentYear, monthIndex + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      const bookings = await Booking.find({
        status: 'completed',
        'payment.status': 'completed',
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      });

      const revenue = bookings.reduce((sum, booking) => sum + booking.commission, 0);

      revenueByMonth.push({
        month: monthNames[monthIndex],
        revenue: Math.round(revenue),
      });
    }

    res.json({
      success: true,
      data: revenueByMonth,
    });
  } catch (error) {
    console.error('Erreur revenue by month:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des revenus',
    });
  }
});

// ==================== RÉSERVATIONS ====================

/**
 * GET /api/bookings/all
 * Récupérer toutes les réservations (pour admin)
 */
router.get('/bookings/all', protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('tractor', 'nom marque modele')
      .populate('client', 'prenom nom telephone')
      .populate('owner', 'prenom nom telephone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error('Erreur récupération bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des réservations',
    });
  }
});

/**
 * PUT /api/bookings/:id/status
 * Mettre à jour le statut d'une réservation
 */
router.put('/bookings/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('tractor', 'nom marque modele')
      .populate('client', 'prenom nom telephone')
      .populate('owner', 'prenom nom telephone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée',
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Erreur mise à jour booking:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
    });
  }
});

// ==================== UTILISATEURS ====================

/**
 * GET /api/users (modifié pour admin)
 * Récupérer tous les utilisateurs
 */
router.get('/users/all', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Erreur récupération users:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
    });
  }
});

/**
 * POST /api/users/:id/verify
 * Vérifier un utilisateur
 */
router.post('/users/:id/verify', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Erreur vérification user:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification',
    });
  }
});

/**
 * POST /api/admin/users
 * Créer un nouvel utilisateur
 */
router.post('/users', protect, adminOnly, async (req, res) => {
  try {
    const { nom, prenom, email, telephone, password, role, adresse, region } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      $or: [{ email }, { telephone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email ou téléphone existe déjà',
      });
    }

    // Créer l'utilisateur
    const user = await User.create({
      nom,
      prenom,
      email,
      telephone,
      password,
      role: role || 'client',
      adresse,
      region,
      isActive: true,
      isVerified: true, // Admin crée des utilisateurs déjà vérifiés
    });

    // Retourner sans le mot de passe
    const userResponse = await User.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    console.error('Erreur création user:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création',
    });
  }
});

/**
 * PUT /api/users/:id
 * Mettre à jour le statut d'un utilisateur
 */
router.put('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const { estActif } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: estActif },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Erreur mise à jour user:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
    });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Supprimer un utilisateur
 */
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    // Vérifier qu'on ne supprime pas un admin
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Impossible de supprimer un administrateur',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur suppression user:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
    });
  }
});

// ==================== TRACTEURS ====================

/**
 * GET /api/tractors/all
 * Récupérer tous les tracteurs (pour admin)
 */
router.get('/tractors/all', protect, adminOnly, async (req, res) => {
  try {
    const tractors = await Tractor.find()
      .populate('owner', 'prenom nom telephone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tractors,
    });
  } catch (error) {
    console.error('Erreur récupération tractors:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tracteurs',
    });
  }
});

/**
 * POST /api/tractors/:id/approve
 * Approuver un tracteur
 */
router.post('/tractors/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const tractor = await Tractor.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate('owner', 'prenom nom');

    if (!tractor) {
      return res.status(404).json({
        success: false,
        message: 'Tracteur non trouvé',
      });
    }

    res.json({
      success: true,
      data: tractor,
    });
  } catch (error) {
    console.error('Erreur approbation tracteur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'approbation',
    });
  }
});

/**
 * POST /api/tractors/:id/reject
 * Rejeter un tracteur
 */
router.post('/tractors/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const tractor = await Tractor.findByIdAndUpdate(
      req.params.id,
      { isApproved: false, isActive: false },
      { new: true }
    ).populate('owner', 'prenom nom');

    if (!tractor) {
      return res.status(404).json({
        success: false,
        message: 'Tracteur non trouvé',
      });
    }

    res.json({
      success: true,
      data: tractor,
    });
  } catch (error) {
    console.error('Erreur rejet tracteur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du rejet',
    });
  }
});

/**
 * POST /api/admin/tractors
 * Créer un nouveau tracteur
 */
router.post('/tractors', protect, adminOnly, async (req, res) => {
  try {
    const {
      nom,
      marque,
      modele,
      annee,
      puissance,
      description,
      prixParHectare,
      owner,
      localisation,
      equipements,
      etat
    } = req.body;

    // Vérifier que le propriétaire existe
    const ownerUser = await User.findById(owner);
    if (!ownerUser || ownerUser.role !== 'proprietaire') {
      return res.status(400).json({
        success: false,
        message: 'Propriétaire invalide',
      });
    }

    // Créer le tracteur
    const tractor = await Tractor.create({
      nom,
      marque,
      modele,
      annee,
      puissance,
      description,
      prixParHectare,
      owner,
      localisation,
      equipements: equipements || [],
      etat: etat || 'bon',
      disponible: true,
      isActive: true,
      isApproved: true, // Admin crée des tracteurs déjà approuvés
    });

    const tractorResponse = await Tractor.findById(tractor._id).populate('owner', 'prenom nom');

    res.status(201).json({
      success: true,
      data: tractorResponse,
    });
  } catch (error) {
    console.error('Erreur création tracteur:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création',
    });
  }
});

/**
 * PUT /api/tractors/:id
 * Mettre à jour le statut d'un tracteur
 */
router.put('/tractors/:id', protect, adminOnly, async (req, res) => {
  try {
    const { estActif } = req.body;

    const tractor = await Tractor.findByIdAndUpdate(
      req.params.id,
      { isActive: estActif },
      { new: true }
    ).populate('owner', 'prenom nom');

    if (!tractor) {
      return res.status(404).json({
        success: false,
        message: 'Tracteur non trouvé',
      });
    }

    res.json({
      success: true,
      data: tractor,
    });
  } catch (error) {
    console.error('Erreur mise à jour tracteur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
    });
  }
});

/**
 * DELETE /api/admin/tractors/:id
 * Supprimer un tracteur
 */
router.delete('/tractors/:id', protect, adminOnly, async (req, res) => {
  try {
    const tractor = await Tractor.findById(req.params.id);

    if (!tractor) {
      return res.status(404).json({
        success: false,
        message: 'Tracteur non trouvé',
      });
    }

    // Vérifier qu'il n'y a pas de réservations actives
    const activeBookings = await Booking.countDocuments({
      tractor: req.params.id,
      status: { $in: ['pending', 'accepted', 'in_progress'] },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un tracteur avec des réservations actives',
      });
    }

    await Tractor.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Tracteur supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur suppression tracteur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
    });
  }
});

// ==================== PAIEMENTS / TRANSACTIONS ====================

/**
 * GET /api/admin/payments/all
 * Récupérer tous les paiements/transactions
 */
router.get('/payments/all', protect, adminOnly, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('payer', 'prenom nom telephone email role')
      .populate('recipient', 'prenom nom telephone email role')
      .populate({
        path: 'booking',
        select: 'reference nombreHectares totalPrice',
        populate: {
          path: 'tractor',
          select: 'nom marque modele'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error('Erreur récupération payments:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paiements',
    });
  }
});

module.exports = router;
