const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// @desc    Webhook Orange Money
// @route   POST /api/webhooks/orange-money
// @access  Public (avec vérification signature)
router.post('/orange-money', async (req, res) => {
  try {
    console.log('Orange Money Webhook received:', req.body);

    const {
      order_id,
      txnid,
      status,
      amount,
      pay_token,
      customer_msisdn
    } = req.body;

    // Trouver le paiement correspondant
    const payment = await Payment.findOne({
      'booking': order_id,
      'providerData.payToken': pay_token
    });

    if (!payment) {
      console.log('Paiement non trouvé pour order_id:', order_id);
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }

    // Mettre à jour le paiement selon le statut
    if (status === 'SUCCESS' || status === 'SUCCESSFUL') {
      payment.markAsCompleted({
        transactionId: txnid,
        providerReference: pay_token
      });
      await payment.save();

      // Mettre à jour la réservation
      const booking = await Booking.findById(payment.booking);
      if (booking && booking.status === 'confirmed') {
        booking.addStatusChange('in_progress', null, 'Paiement reçu via Orange Money');
        await booking.save();
      }

      // Notifier le propriétaire
      await Notification.createNotification(
        payment.recipient,
        'payment_received',
        'Paiement reçu !',
        `Vous avez reçu ${payment.ownerAmount} FCFA via Orange Money`,
        { paymentId: payment._id, bookingId: payment.booking }
      );

    } else if (status === 'FAILED' || status === 'EXPIRED') {
      payment.markAsFailed(`Échec Orange Money: ${status}`);
      await payment.save();

      // Notifier le client
      await Notification.createNotification(
        payment.payer,
        'payment_failed',
        'Échec du paiement',
        `Le paiement Orange Money de ${payment.amount} FCFA a échoué`,
        { paymentId: payment._id, bookingId: payment.booking }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Webhook traité'
    });
  } catch (error) {
    console.error('Erreur webhook Orange Money:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement du webhook'
    });
  }
});

// @desc    Webhook Wave
// @route   POST /api/webhooks/wave
// @access  Public (avec vérification signature)
router.post('/wave', async (req, res) => {
  try {
    console.log('Wave Webhook received:', req.body);

    const {
      type,
      data
    } = req.body;

    // Vérifier le type d'événement
    if (type !== 'checkout.session.completed' && type !== 'checkout.session.failed') {
      return res.status(200).json({
        success: true,
        message: 'Type d\'événement non géré'
      });
    }

    const {
      id: checkoutSessionId,
      client_reference,
      payment_status,
      amount,
      currency
    } = data;

    // Trouver le paiement correspondant
    const payment = await Payment.findOne({
      'providerData.checkoutSessionId': checkoutSessionId
    });

    if (!payment) {
      console.log('Paiement non trouvé pour checkoutSessionId:', checkoutSessionId);
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }

    // Mettre à jour le paiement selon le statut
    if (type === 'checkout.session.completed' && payment_status === 'succeeded') {
      payment.markAsCompleted({
        transactionId: client_reference,
        providerReference: checkoutSessionId
      });
      await payment.save();

      // Mettre à jour la réservation
      const booking = await Booking.findById(payment.booking);
      if (booking && booking.status === 'confirmed') {
        booking.addStatusChange('in_progress', null, 'Paiement reçu via Wave');
        await booking.save();
      }

      // Notifier le propriétaire
      await Notification.createNotification(
        payment.recipient,
        'payment_received',
        'Paiement reçu !',
        `Vous avez reçu ${payment.ownerAmount} FCFA via Wave`,
        { paymentId: payment._id, bookingId: payment.booking }
      );

    } else if (type === 'checkout.session.failed') {
      payment.markAsFailed('Échec Wave: session échouée');
      await payment.save();

      // Notifier le client
      await Notification.createNotification(
        payment.payer,
        'payment_failed',
        'Échec du paiement',
        `Le paiement Wave de ${payment.amount} FCFA a échoué`,
        { paymentId: payment._id, bookingId: payment.booking }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Webhook traité'
    });
  } catch (error) {
    console.error('Erreur webhook Wave:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement du webhook'
    });
  }
});

// @desc    Callback succès Orange Money
// @route   GET /api/webhooks/orange-money/success
// @access  Public
router.get('/orange-money/success', async (req, res) => {
  const { order_id, pay_token } = req.query;

  // Rediriger vers l'application mobile ou web
  res.redirect(`${process.env.APP_URL}/payment-success?order=${order_id}&token=${pay_token}`);
});

// @desc    Callback annulation Orange Money
// @route   GET /api/webhooks/orange-money/cancel
// @access  Public
router.get('/orange-money/cancel', async (req, res) => {
  const { order_id } = req.query;

  // Rediriger vers l'application mobile ou web
  res.redirect(`${process.env.APP_URL}/payment-cancelled?order=${order_id}`);
});

// @desc    Callback succès Wave
// @route   GET /api/webhooks/wave/success
// @access  Public
router.get('/wave/success', async (req, res) => {
  const { booking } = req.query;

  // Rediriger vers l'application mobile ou web
  res.redirect(`${process.env.APP_URL}/payment-success?booking=${booking}`);
});

// @desc    Callback erreur Wave
// @route   GET /api/webhooks/wave/error
// @access  Public
router.get('/wave/error', async (req, res) => {
  // Rediriger vers l'application mobile ou web
  res.redirect(`${process.env.APP_URL}/payment-error`);
});

// @desc    Webhook PayDunya
// @route   POST /api/webhooks/paydunya
// @access  Public (avec vérification signature)
router.post('/paydunya', async (req, res) => {
  try {
    console.log('PayDunya Webhook received:', req.body);

    const {
      data,
      hash
    } = req.body;

    // Vérifier le hash pour la sécurité
    const crypto = require('crypto');
    const expectedHash = crypto
      .createHash('sha512')
      .update(JSON.stringify(data) + process.env.PAYDUNYA_MASTER_KEY)
      .digest('hex');

    if (hash !== expectedHash) {
      console.log('Hash invalide pour le webhook PayDunya');
      return res.status(403).json({
        success: false,
        message: 'Signature invalide'
      });
    }

    const {
      invoice: {
        token: invoiceToken,
        status,
        total_amount,
        custom_data
      }
    } = data;

    // Trouver le paiement correspondant
    const payment = await Payment.findOne({
      'providerData.invoiceToken': invoiceToken
    });

    if (!payment) {
      console.log('Paiement non trouvé pour invoiceToken:', invoiceToken);
      return res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
    }

    // Mettre à jour le paiement selon le statut
    if (status === 'completed') {
      payment.markAsCompleted({
        transactionId: custom_data?.transaction_id || invoiceToken,
        providerReference: invoiceToken
      });
      await payment.save();

      // Mettre à jour la réservation
      const booking = await Booking.findById(payment.booking);
      if (booking && booking.status === 'confirmed') {
        booking.addStatusChange('in_progress', null, 'Paiement reçu via PayDunya');
        await booking.save();
      }

      // Notifier le propriétaire
      await Notification.createNotification(
        payment.recipient,
        'payment_received',
        'Paiement reçu !',
        `Vous avez reçu ${payment.ownerAmount} FCFA via PayDunya`,
        { paymentId: payment._id, bookingId: payment.booking }
      );

    } else if (status === 'cancelled' || status === 'failed') {
      payment.markAsFailed(`Échec PayDunya: ${status}`);
      await payment.save();

      // Notifier le client
      await Notification.createNotification(
        payment.payer,
        'payment_failed',
        'Échec du paiement',
        `Le paiement PayDunya de ${payment.amount} FCFA a échoué`,
        { paymentId: payment._id, bookingId: payment.booking }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Webhook traité'
    });
  } catch (error) {
    console.error('Erreur webhook PayDunya:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement du webhook'
    });
  }
});

// @desc    Callback succès PayDunya
// @route   GET /api/webhooks/paydunya/success
// @access  Public
router.get('/paydunya/success', async (req, res) => {
  const { booking, token } = req.query;

  // Rediriger vers l'application mobile ou web
  res.redirect(`${process.env.APP_URL}/payment-success?booking=${booking}&token=${token}`);
});

// @desc    Callback annulation PayDunya
// @route   GET /api/webhooks/paydunya/cancel
// @access  Public
router.get('/paydunya/cancel', async (req, res) => {
  const { booking } = req.query;

  // Rediriger vers l'application mobile ou web
  res.redirect(`${process.env.APP_URL}/payment-cancelled?booking=${booking}`);
});

module.exports = router;
