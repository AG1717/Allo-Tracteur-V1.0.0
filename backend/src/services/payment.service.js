const axios = require('axios');
const Stripe = require('stripe');
const { v4: uuidv4 } = require('uuid');

// Initialiser Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * SERVICE ORANGE MONEY
 */
const orangeMoneyService = {
  async getAccessToken() {
    try {
      const response = await axios.post(
        'https://api.orange.com/oauth/v3/token',
        new URLSearchParams({ grant_type: 'client_credentials' }),
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(
              `${process.env.ORANGE_MONEY_CLIENT_ID}:${process.env.ORANGE_MONEY_CLIENT_SECRET}`
            ).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error('Erreur Orange Money Token:', error.response?.data || error.message);
      throw new Error('Impossible de se connecter à Orange Money');
    }
  },

  async initiatePayment({ amount, phoneNumber, bookingId, description }) {
    try {
      const accessToken = await this.getAccessToken();
      const transactionId = `OM-${uuidv4()}`;

      const response = await axios.post(
        `${process.env.ORANGE_MONEY_API_URL}/webpayment`,
        {
          merchant_key: process.env.ORANGE_MONEY_MERCHANT_KEY,
          currency: 'XOF',
          order_id: bookingId,
          amount: amount,
          return_url: `${process.env.APP_URL}/api/payments/orange-money/callback`,
          cancel_url: `${process.env.APP_URL}/api/payments/orange-money/cancel`,
          notif_url: `${process.env.APP_URL}/api/payments/orange-money/webhook`,
          lang: 'fr',
          reference: transactionId,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        transactionId,
        paymentUrl: response.data.payment_url,
        payToken: response.data.pay_token,
      };
    } catch (error) {
      console.error('Erreur Orange Money Payment:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur de paiement Orange Money',
      };
    }
  },

  async checkPaymentStatus(payToken) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.get(
        `${process.env.ORANGE_MONEY_API_URL}/webpayment/${payToken}`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );

      return {
        success: true,
        status: response.data.status,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur de vérification',
      };
    }
  },
};

/**
 * SERVICE WAVE
 */
const waveService = {
  async initiatePayment({ amount, phoneNumber, bookingId, description }) {
    try {
      const transactionId = `WAVE-${uuidv4()}`;

      const response = await axios.post(
        `${process.env.WAVE_API_URL}/checkout/sessions`,
        {
          amount: amount.toString(),
          currency: 'XOF',
          error_url: `${process.env.APP_URL}/api/payments/wave/error`,
          success_url: `${process.env.APP_URL}/api/payments/wave/success?booking=${bookingId}`,
          client_reference: transactionId,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.WAVE_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        transactionId,
        paymentUrl: response.data.wave_launch_url,
        checkoutSessionId: response.data.id,
      };
    } catch (error) {
      console.error('Erreur Wave Payment:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur de paiement Wave',
      };
    }
  },

  async checkPaymentStatus(checkoutSessionId) {
    try {
      const response = await axios.get(
        `${process.env.WAVE_API_URL}/checkout/sessions/${checkoutSessionId}`,
        {
          headers: { 'Authorization': `Bearer ${process.env.WAVE_API_KEY}` },
        }
      );

      return {
        success: true,
        status: response.data.payment_status,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur de vérification',
      };
    }
  },
};

/**
 * SERVICE PAYDUNYA
 */
const paydunyaService = {
  async initiatePayment({ amount, phoneNumber, bookingId, description }) {
    try {
      const transactionId = `PAYDUNYA-${uuidv4()}`;

      // Configuration PayDunya
      const storeData = {
        name: process.env.PAYDUNYA_STORE_NAME || 'AlloTracteur',
        tagline: 'Location de tracteurs agricoles',
        phone: process.env.PAYDUNYA_STORE_PHONE || '',
        postal_address: process.env.PAYDUNYA_STORE_ADDRESS || 'Sénégal',
        logo_url: process.env.PAYDUNYA_STORE_LOGO || '',
      };

      // Créer la facture
      const invoiceResponse = await axios.post(
        `${process.env.PAYDUNYA_API_URL || 'https://app.paydunya.com/api/v1'}/checkout-invoice/create`,
        {
          invoice: {
            total_amount: amount,
            description: description || `Réservation de tracteur - ${bookingId}`,
          },
          store: storeData,
          actions: {
            callback_url: `${process.env.APP_URL}/api/webhooks/paydunya`,
            return_url: `${process.env.APP_URL}/api/webhooks/paydunya/success?booking=${bookingId}`,
            cancel_url: `${process.env.APP_URL}/api/webhooks/paydunya/cancel?booking=${bookingId}`,
          },
          custom_data: {
            booking_id: bookingId,
            transaction_id: transactionId,
            phone_number: phoneNumber,
          },
        },
        {
          headers: {
            'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY,
            'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY,
            'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN,
            'Content-Type': 'application/json',
          },
        }
      );

      if (invoiceResponse.data.response_code === '00') {
        return {
          success: true,
          transactionId,
          paymentUrl: invoiceResponse.data.response_text,
          invoiceToken: invoiceResponse.data.token,
        };
      } else {
        return {
          success: false,
          error: invoiceResponse.data.response_text || 'Erreur lors de la création de la facture PayDunya',
        };
      }
    } catch (error) {
      console.error('Erreur PayDunya Payment:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.response_text || 'Erreur de paiement PayDunya',
      };
    }
  },

  async checkPaymentStatus(invoiceToken) {
    try {
      const response = await axios.get(
        `${process.env.PAYDUNYA_API_URL || 'https://app.paydunya.com/api/v1'}/checkout-invoice/confirm/${invoiceToken}`,
        {
          headers: {
            'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY,
            'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY,
            'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN,
          },
        }
      );

      return {
        success: true,
        status: response.data.status,
        data: response.data,
      };
    } catch (error) {
      console.error('Erreur PayDunya Status Check:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.response_text || 'Erreur de vérification PayDunya',
      };
    }
  },
};

/**
 * SERVICE STRIPE (Cartes bancaires)
 */
const stripeService = {
  async createPaymentIntent({ amount, currency = 'xof', bookingId, customerEmail }) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency.toLowerCase(),
        metadata: { bookingId },
        receipt_email: customerEmail,
        automatic_payment_methods: { enabled: true },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Erreur Stripe:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: paymentIntent.status === 'succeeded',
        status: paymentIntent.status,
        data: paymentIntent,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  async createRefund(paymentIntentId, amount = null) {
    try {
      const refundData = { payment_intent: paymentIntentId };
      if (amount) refundData.amount = amount;

      const refund = await stripe.refunds.create(refundData);

      return {
        success: true,
        refundId: refund.id,
        status: refund.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

/**
 * SERVICE UNIFIÉ DE PAIEMENT
 */
const paymentService = {
  async initiatePayment(method, paymentData) {
    switch (method) {
      case 'orange_money':
        return orangeMoneyService.initiatePayment(paymentData);
      case 'wave':
        return waveService.initiatePayment(paymentData);
      case 'paydunya':
        return paydunyaService.initiatePayment(paymentData);
      case 'card':
        return stripeService.createPaymentIntent(paymentData);
      case 'cash':
        return {
          success: true,
          transactionId: `CASH-${uuidv4()}`,
          message: 'Paiement en espèces - À régler directement au propriétaire',
        };
      default:
        return {
          success: false,
          error: 'Méthode de paiement non supportée',
        };
    }
  },

  async checkPaymentStatus(method, transactionId) {
    switch (method) {
      case 'orange_money':
        return orangeMoneyService.checkPaymentStatus(transactionId);
      case 'wave':
        return waveService.checkPaymentStatus(transactionId);
      case 'paydunya':
        return paydunyaService.checkPaymentStatus(transactionId);
      case 'card':
        return stripeService.confirmPayment(transactionId);
      case 'cash':
        return { success: true, status: 'pending' };
      default:
        return { success: false, error: 'Méthode non supportée' };
    }
  },
};

module.exports = {
  paymentService,
  orangeMoneyService,
  waveService,
  paydunyaService,
  stripeService,
};
