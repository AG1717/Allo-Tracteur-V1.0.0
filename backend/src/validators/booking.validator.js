const { body } = require('express-validator');

// Validation création réservation
exports.createBookingValidator = [
  body('tractorId')
    .notEmpty().withMessage('L\'ID du tracteur est requis')
    .isMongoId().withMessage('ID de tracteur invalide'),

  body('startDate')
    .notEmpty().withMessage('La date de début est requise')
    .isISO8601().withMessage('Format de date invalide')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('La date de début ne peut pas être dans le passé');
      }
      return true;
    }),

  body('endDate')
    .notEmpty().withMessage('La date de fin est requise')
    .isISO8601().withMessage('Format de date invalide')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('La date de fin doit être après la date de début');
      }
      return true;
    }),

  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Les notes ne peuvent pas dépasser 500 caractères')
];

// Validation annulation
exports.cancelBookingValidator = [
  body('reason')
    .optional()
    .isLength({ max: 500 }).withMessage('La raison ne peut pas dépasser 500 caractères')
];
