/**
 * Service SMS pour Allo Tracteur
 * À intégrer avec Orange SMS API ou autre fournisseur
 */

class SMSService {
  constructor() {
    this.apiKey = process.env.SMS_API_KEY;
    this.senderId = process.env.SMS_SENDER_ID || 'AlloTracteur';
  }

  /**
   * Envoyer un SMS
   * @param {string} phoneNumber - Numéro de téléphone
   * @param {string} message - Message à envoyer
   */
  async send(phoneNumber, message) {
    // TODO: Intégrer avec l'API SMS réelle
    console.log(`[SMS] Envoi à ${phoneNumber}: ${message}`);

    // Simulation
    return {
      success: true,
      messageId: `SMS_${Date.now()}`,
      to: phoneNumber
    };
  }

  /**
   * Envoyer un code de vérification
   */
  async sendVerificationCode(phoneNumber, code) {
    const message = `Votre code de vérification Allo Tracteur est: ${code}. Valide 10 minutes.`;
    return this.send(phoneNumber, message);
  }

  /**
   * Notifier une nouvelle réservation
   */
  async notifyNewBooking(phoneNumber, bookingRef, tractorName) {
    const message = `Nouvelle demande de réservation ${bookingRef} pour ${tractorName}. Connectez-vous pour répondre.`;
    return this.send(phoneNumber, message);
  }

  /**
   * Notifier l'acceptation d'une réservation
   */
  async notifyBookingAccepted(phoneNumber, bookingRef) {
    const message = `Bonne nouvelle! Votre réservation ${bookingRef} a été acceptée. Procédez au paiement.`;
    return this.send(phoneNumber, message);
  }

  /**
   * Notifier un paiement reçu
   */
  async notifyPaymentReceived(phoneNumber, amount, bookingRef) {
    const message = `Paiement de ${amount} FCFA reçu pour la réservation ${bookingRef}. Merci!`;
    return this.send(phoneNumber, message);
  }
}

module.exports = new SMSService();
