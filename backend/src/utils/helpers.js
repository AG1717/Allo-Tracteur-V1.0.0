/**
 * Utilitaires pour l'API Allo Tracteur
 */

// Formater le montant en FCFA
exports.formatAmount = (amount) => {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
};

// Générer un code aléatoire
exports.generateCode = (length = 6) => {
  const chars = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

// Générer une référence unique
exports.generateReference = (prefix = 'REF') => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${year}${month}-${random}`;
};

// Calculer la distance entre deux points (formule de Haversine)
exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

function toRad(deg) {
  return deg * (Math.PI / 180);
}

// Pagination helper
exports.paginate = (page = 1, limit = 20) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  return {
    skip,
    limit: parseInt(limit)
  };
};

// Nettoyer un objet des valeurs undefined
exports.cleanObject = (obj) => {
  const cleaned = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
};

// Formater une date en français
exports.formatDateFR = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Calculer le nombre de jours entre deux dates
exports.daysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Valider un numéro de téléphone sénégalais
exports.isValidSenegalPhone = (phone) => {
  const regex = /^(\+221)?[0-9]{9}$/;
  return regex.test(phone.replace(/\s/g, ''));
};

// Formater un numéro de téléphone
exports.formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('221')) {
    return `+${cleaned}`;
  }
  return `+221${cleaned}`;
};
