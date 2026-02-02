const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// @desc    Initier un paiement
// @route   POST /api/payments
// @access  Private
exports.initiatePayment = async (req, res, next) => {
  try {
    const { bookingId, method, phoneNumber } = req.body;

    // Vérifier la réservation
    const booking = await Booking.findById(bookingId)
      .populate('tractor')
      .populate('owner');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
    }

    if (booking.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'La réservation doit être confirmée pour procéder au paiement'
      });
    }

    // Vérifier si un paiement existe déjà
    const existingPayment = await Payment.findOne({
      booking: bookingId,
      status: { $in: ['pending', 'processing', 'completed'] }
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Un paiement est déjà en cours ou complété pour cette réservation'
      });
    }

    // Créer le paiement
    const payment = await Payment.create({
      booking: bookingId,
      payer: req.user.id,
      recipient: booking.owner._id,
      amount: booking.pricing.totalPrice,
      platformFee: booking.pricing.platformFee,
      ownerAmount: booking.pricing.ownerAmount,
      method,
      providerData: {
        phoneNumber
      },
      statusHistory: [{
        status: 'pending',
        note: 'Paiement initié'
      }]
    });

    // Mettre à jour la réservation avec le paiement
    booking.payment = payment._id;
    await booking.save();

    // TODO: Intégrer avec Orange Money / Wave API
    // Pour l'instant, on simule le succès après quelques secondes

    res.status(201).json({
      success: true,
      message: 'Paiement initié',
      data: {
        payment,
        instructions: method === 'orange_money'
          ? `Composez #144# et suivez les instructions pour payer ${booking.pricing.totalPrice} FCFA`
          : `Ouvrez Wave et envoyez ${booking.pricing.totalPrice} FCFA au numéro indiqué`
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirmer un paiement (callback provider ou manuel)
// @route   PUT /api/payments/:id/confirm
// @access  Private/Admin ou Webhook
exports.confirmPayment = async (req, res, next) => {
  try {
    const { transactionId, providerReference } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }

    if (payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Ce paiement est déjà confirmé'
      });
    }

    payment.markAsCompleted({ transactionId, providerReference });
    await payment.save();

    // Mettre à jour le statut de la réservation
    const booking = await Booking.findById(payment.booking);
    if (booking && booking.status === 'confirmed') {
      booking.addStatusChange('in_progress', null, 'Paiement reçu');
      await booking.save();
    }

    // Notifier le propriétaire
    await Notification.createNotification(
      payment.recipient,
      'payment_received',
      'Paiement reçu !',
      `Vous avez reçu ${payment.ownerAmount} FCFA pour une location`,
      { paymentId: payment._id, bookingId: payment.booking }
    );

    res.status(200).json({
      success: true,
      message: 'Paiement confirmé',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Marquer un paiement comme échoué
// @route   PUT /api/payments/:id/fail
// @access  Private/Admin ou Webhook
exports.failPayment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }

    payment.markAsFailed(reason || 'Échec du paiement');
    await payment.save();

    // Notifier le client
    await Notification.createNotification(
      payment.payer,
      'payment_failed',
      'Échec du paiement',
      `Le paiement de ${payment.amount} FCFA a échoué. Veuillez réessayer.`,
      { paymentId: payment._id, bookingId: payment.booking }
    );

    res.status(200).json({
      success: true,
      message: 'Paiement marqué comme échoué',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir l'historique des paiements (client)
// @route   GET /api/payments/my-payments
// @access  Private
exports.getMyPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = { payer: req.user.id };
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('booking', 'reference startDate endDate')
      .populate('recipient', 'nom prenom')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les paiements reçus (propriétaire)
// @route   GET /api/payments/received
// @access  Private/Owner
exports.getReceivedPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = { recipient: req.user.id };
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('booking', 'reference startDate endDate')
      .populate('payer', 'nom prenom')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments(query);

    // Calculer les totaux
    const totals = await Payment.aggregate([
      { $match: { recipient: req.user._id, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$ownerAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Revenus ce mois
    const thisMonthStart = new Date(new Date().setDate(1));
    const monthlyTotals = await Payment.aggregate([
      {
        $match: {
          recipient: req.user._id,
          status: 'completed',
          completedAt: { $gte: thisMonthStart }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$ownerAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      totals: totals[0] || { totalAmount: 0, count: 0 },
      monthlyTotals: monthlyTotals[0] || { totalAmount: 0, count: 0 },
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les statistiques de paiement (propriétaire)
// @route   GET /api/payments/stats
// @access  Private/Owner
exports.getPaymentStats = async (req, res, next) => {
  try {
    // Revenus par mois (6 derniers mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          recipient: req.user._id,
          status: 'completed',
          completedAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' }
          },
          total: { $sum: '$ownerAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Total global
    const totalStats = await Payment.aggregate([
      { $match: { recipient: req.user._id, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$ownerAmount' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        monthlyRevenue,
        totals: totalStats[0] || { totalEarnings: 0, totalTransactions: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Statistiques globales (admin)
// @route   GET /api/payments/admin/stats
// @access  Private/Admin
exports.getAdminPaymentStats = async (req, res, next) => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          platformFees: { $sum: '$platformFee' }
        }
      }
    ]);

    const byMethod = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: stats,
        byMethod
      }
    });
  } catch (error) {
    next(error);
  }
};
