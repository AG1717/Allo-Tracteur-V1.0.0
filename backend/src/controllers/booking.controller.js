const Booking = require('../models/Booking');
const Tractor = require('../models/Tractor');
const Notification = require('../models/Notification');

const PLATFORM_FEE_PERCENT = 10; // 10% de commission

// @desc    Créer une réservation
// @route   POST /api/bookings
// @access  Private/Client
exports.createBooking = async (req, res, next) => {
  try {
    const {
      tractorId,
      startDate,
      endDate,
      nombreHectares,
      surfaceMetresCarres,
      notes,
      clientPhone,
      paymentMethod
    } = req.body;

    // Vérifier que le tracteur existe et est disponible
    const tractor = await Tractor.findById(tractorId).populate('owner');

    if (!tractor) {
      return res.status(404).json({
        success: false,
        message: 'Tracteur non trouvé'
      });
    }

    if (!tractor.isAvailable || !tractor.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Ce tracteur n\'est pas disponible'
      });
    }

    // Vérifier que la surface est fournie
    if (!nombreHectares || nombreHectares <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Le nombre d\'hectares est requis'
      });
    }

    // Vérifier la disponibilité pour la période (optionnel pour planification)
    if (startDate && endDate && !tractor.isAvailableForPeriod(startDate, endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Ce tracteur est déjà réservé pour cette période'
      });
    }

    // Calculer la durée (pour planification uniquement, si dates fournies)
    let nombreJours = null;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      nombreJours = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    // Calculer le prix basé uniquement sur la surface
    const basePrice = tractor.prixParHectare * nombreHectares;
    const platformFee = Math.round(basePrice * PLATFORM_FEE_PERCENT / 100);
    const ownerAmount = basePrice - platformFee;

    // Créer la réservation
    const bookingData = {
      client: req.user.id,
      tractor: tractorId,
      owner: tractor.owner._id,
      nombreHectares,
      prixParHectare: tractor.prixParHectare,
      totalPrice: basePrice,
      commission: platformFee,
      ownerEarnings: ownerAmount,
      clientPhone: clientPhone || req.user.telephone,
      ownerPhone: tractor.owner.telephone,
      payment: {
        method: paymentMethod || 'orange_money',
        status: 'pending'
      },
      notes
    };

    // Ajouter les dates si fournies
    if (startDate) bookingData.startDate = new Date(startDate);
    if (endDate) bookingData.endDate = new Date(endDate);
    if (nombreJours) bookingData.nombreJours = nombreJours;

    // Ajouter surfaceMetresCarres si fourni
    if (surfaceMetresCarres) {
      bookingData.surfaceMetresCarres = surfaceMetresCarres;
    }

    const booking = await Booking.create(bookingData);

    // Notifier le propriétaire
    await Notification.createNotification(
      tractor.owner._id,
      'booking_request',
      'Nouvelle demande de réservation',
      `${req.user.prenom} ${req.user.nom} souhaite réserver ${tractor.nom}`,
      { bookingId: booking._id }
    );

    const populatedBooking = await Booking.findById(booking._id)
      .populate('tractor', 'nom marque images prixParHectare')
      .populate('client', 'nom prenom telephone')
      .populate('owner', 'nom prenom telephone');

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      data: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir mes réservations (client)
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = { client: req.user.id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('tractor', 'nom marque images prixParHectare localisation')
      .populate('owner', 'nom prenom telephone rating')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limit),
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les demandes reçues (propriétaire)
// @route   GET /api/bookings/requests
// @access  Private/Owner
exports.getReceivedRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = { owner: req.user.id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('tractor', 'nom marque images prixParHectare')
      .populate('client', 'nom prenom telephone email rating')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limit),
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir une réservation par ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('tractor')
      .populate('client', 'nom prenom telephone email rating')
      .populate('owner', 'nom prenom telephone email rating');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    // Vérifier que l'utilisateur a accès
    if (
      booking.client._id.toString() !== req.user.id &&
      booking.owner._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accepter une réservation
// @route   PUT /api/bookings/:id/accept
// @access  Private/Owner
exports.acceptBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    if (booking.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cette réservation ne peut plus être acceptée'
      });
    }

    booking.addStatusChange('confirmed', req.user.id, 'Acceptée par le propriétaire');
    await booking.save();

    // Bloquer les dates sur le tracteur
    await Tractor.findByIdAndUpdate(booking.tractor, {
      $push: {
        blockedDates: {
          startDate: booking.startDate,
          endDate: booking.endDate,
          reason: `Réservation ${booking.reference}`
        }
      }
    });

    // Notifier le client
    await Notification.createNotification(
      booking.client,
      'booking_confirmed',
      'Réservation confirmée !',
      `Votre réservation ${booking.reference} a été acceptée`,
      { bookingId: booking._id }
    );

    res.status(200).json({
      success: true,
      message: 'Réservation acceptée',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refuser une réservation
// @route   PUT /api/bookings/:id/reject
// @access  Private/Owner
exports.rejectBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    if (booking.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cette réservation ne peut plus être refusée'
      });
    }

    booking.addStatusChange('rejected', req.user.id, reason || 'Refusée par le propriétaire');
    await booking.save();

    // Notifier le client
    await Notification.createNotification(
      booking.client,
      'booking_rejected',
      'Réservation refusée',
      `Votre réservation ${booking.reference} a été refusée`,
      { bookingId: booking._id }
    );

    res.status(200).json({
      success: true,
      message: 'Réservation refusée',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Annuler une réservation
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    // Vérifier que l'utilisateur peut annuler
    if (
      booking.client.toString() !== req.user.id &&
      booking.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cette réservation ne peut plus être annulée'
      });
    }

    booking.cancellation = {
      cancelledBy: req.user.id,
      reason,
      cancelledAt: new Date()
    };
    booking.addStatusChange('cancelled', req.user.id, reason);
    await booking.save();

    // Débloquer les dates sur le tracteur
    await Tractor.findByIdAndUpdate(booking.tractor, {
      $pull: {
        blockedDates: {
          startDate: booking.startDate,
          endDate: booking.endDate
        }
      }
    });

    // Notifier l'autre partie
    const notifyUserId = req.user.id === booking.client.toString()
      ? booking.owner
      : booking.client;

    await Notification.createNotification(
      notifyUserId,
      'booking_cancelled',
      'Réservation annulée',
      `La réservation ${booking.reference} a été annulée`,
      { bookingId: booking._id }
    );

    res.status(200).json({
      success: true,
      message: 'Réservation annulée',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Démarrer une réservation
// @route   PUT /api/bookings/:id/start
// @access  Private/Owner
exports.startBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    if (booking.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'La réservation doit être confirmée avant de démarrer'
      });
    }

    booking.addStatusChange('in_progress', req.user.id, 'Location démarrée');
    await booking.save();

    // Notifier le client
    await Notification.createNotification(
      booking.client,
      'booking_started',
      'Location démarrée',
      `Votre location ${booking.reference} a commencé`,
      { bookingId: booking._id }
    );

    res.status(200).json({
      success: true,
      message: 'Location démarrée',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Terminer une réservation
// @route   PUT /api/bookings/:id/complete
// @access  Private/Owner
exports.completeBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    if (booking.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    if (booking.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'La location doit être en cours pour être terminée'
      });
    }

    booking.addStatusChange('completed', req.user.id, 'Location terminée');
    await booking.save();

    // Mettre à jour les stats du tracteur
    await Tractor.findByIdAndUpdate(booking.tractor, {
      $inc: {
        totalBookings: 1,
        'stats.totalEarnings': booking.pricing.ownerAmount,
        'stats.totalDaysRented': booking.duration
      }
    });

    // Notifier le client
    await Notification.createNotification(
      booking.client,
      'booking_completed',
      'Location terminée',
      `Votre location ${booking.reference} est terminée. N'oubliez pas de laisser un avis !`,
      { bookingId: booking._id }
    );

    res.status(200).json({
      success: true,
      message: 'Location terminée',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Statistiques des réservations
// @route   GET /api/bookings/admin/stats
// @access  Private/Owner,Admin
exports.getBookingStats = async (req, res, next) => {
  try {
    // Filtrer par propriétaire si ce n'est pas un admin
    const matchFilter = {};
    if (req.user.role !== 'admin') {
      matchFilter.owner = req.user._id;
    }

    const stats = await Booking.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    const total = await Booking.countDocuments(matchFilter);
    const thisMonth = await Booking.countDocuments({
      ...matchFilter,
      createdAt: { $gte: new Date(new Date().setDate(1)) }
    });

    // Transformer byStatus en format plat pour le mobile
    const statusCounts = {
      pending: 0,
      confirmed: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      rejected: 0,
    };
    let totalRevenue = 0;
    stats.forEach((s) => {
      if (statusCounts.hasOwnProperty(s._id)) {
        statusCounts[s._id] = s.count;
      }
      if (s._id === 'completed') {
        totalRevenue = s.totalRevenue || 0;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        thisMonth,
        ...statusCounts,
        totalRevenue,
        byStatus: stats,
      }
    });
  } catch (error) {
    next(error);
  }
};
