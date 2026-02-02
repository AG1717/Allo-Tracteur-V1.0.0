const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// @desc    Créer un avis
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment, detailedRatings } = req.body;

    // Vérifier la réservation
    const booking = await Booking.findById(bookingId)
      .populate('tractor')
      .populate('client')
      .populate('owner');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez laisser un avis que pour une réservation terminée'
      });
    }

    // Déterminer qui laisse l'avis et qui est évalué
    let reviewedUser, type;
    if (booking.client._id.toString() === req.user.id) {
      // Le client évalue le propriétaire et le tracteur
      reviewedUser = booking.owner._id;
      type = 'client_to_owner';
    } else if (booking.owner._id.toString() === req.user.id) {
      // Le propriétaire évalue le client
      reviewedUser = booking.client._id;
      type = 'owner_to_client';
    } else {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à laisser un avis pour cette réservation'
      });
    }

    // Vérifier si un avis existe déjà
    const existingReview = await Review.findOne({
      booking: bookingId,
      reviewer: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà laissé un avis pour cette réservation'
      });
    }

    // Créer l'avis
    const review = await Review.create({
      booking: bookingId,
      tractor: booking.tractor._id,
      reviewer: req.user.id,
      reviewedUser,
      type,
      rating,
      comment,
      detailedRatings
    });

    // Marquer la réservation comme ayant un avis
    booking.hasReview = true;
    await booking.save();

    // Notifier la personne évaluée
    await Notification.createNotification(
      reviewedUser,
      'review_received',
      'Nouvel avis reçu',
      `Vous avez reçu un avis de ${rating} étoiles`,
      { reviewId: review._id, bookingId }
    );

    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'nom prenom avatar')
      .populate('tractor', 'name');

    res.status(201).json({
      success: true,
      message: 'Avis créé avec succès',
      data: populatedReview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les avis d'un tracteur
// @route   GET /api/reviews/tractor/:tractorId
// @access  Public
exports.getTractorReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({
      tractor: req.params.tractorId,
      isVisible: true,
      type: 'client_to_owner'
    })
      .populate('reviewer', 'nom prenom avatar')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments({
      tractor: req.params.tractorId,
      isVisible: true,
      type: 'client_to_owner'
    });

    // Calculer les statistiques
    const stats = await Review.aggregate([
      {
        $match: {
          tractor: require('mongoose').Types.ObjectId(req.params.tractorId),
          isVisible: true,
          type: 'client_to_owner'
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      stats: stats[0] || { avgRating: 0, count: 0 },
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les avis d'un utilisateur
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getUserReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({
      reviewedUser: req.params.userId,
      isVisible: true
    })
      .populate('reviewer', 'nom prenom avatar')
      .populate('tractor', 'name')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments({
      reviewedUser: req.params.userId,
      isVisible: true
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Répondre à un avis
// @route   PUT /api/reviews/:id/respond
// @access  Private
exports.respondToReview = async (req, res, next) => {
  try {
    const { content } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    // Vérifier que c'est la personne évaluée qui répond
    if (review.reviewedUser.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas répondre à cet avis'
      });
    }

    if (review.response && review.response.content) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà répondu à cet avis'
      });
    }

    review.response = {
      content,
      respondedAt: new Date()
    };
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Réponse ajoutée',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Signaler un avis
// @route   POST /api/reviews/:id/report
// @access  Private
exports.reportReview = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    // Vérifier si l'utilisateur a déjà signalé
    const alreadyReported = review.reportedBy.some(
      r => r.user.toString() === req.user.id
    );

    if (alreadyReported) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà signalé cet avis'
      });
    }

    review.reportedBy.push({
      user: req.user.id,
      reason,
      reportedAt: new Date()
    });
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Avis signalé'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Masquer un avis (admin)
// @route   PUT /api/reviews/:id/hide
// @access  Private/Admin
exports.hideReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isVisible: false },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Avis masqué',
      data: review
    });
  } catch (error) {
    next(error);
  }
};
