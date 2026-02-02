const { body, validationResult } = require('express-validator');

// Middleware pour gérer les erreurs de validation
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Validation inscription
exports.registerValidator = [
  body('nom')
    .trim()
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ max: 50 }).withMessage('Le nom ne peut pas dépasser 50 caractères'),

  body('prenom')
    .trim()
    .notEmpty().withMessage('Le prénom est requis')
    .isLength({ max: 50 }).withMessage('Le prénom ne peut pas dépasser 50 caractères'),

  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),

  body('telephone')
    .trim()
    .notEmpty().withMessage('Le téléphone est requis')
    .matches(/^(\+221)?[0-9]{9}$/).withMessage('Numéro de téléphone sénégalais invalide'),

  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit avoir au moins 6 caractères'),

  body('role')
    .optional()
    .isIn(['client', 'owner']).withMessage('Rôle invalide')
];

// Validation connexion
exports.loginValidator = [
  body('email')
    .optional()
    .isEmail().withMessage('Email invalide'),

  body('telephone')
    .optional()
    .matches(/^(\+221)?[0-9]{9}$/).withMessage('Numéro de téléphone invalide'),

  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
];

// Validation mise à jour mot de passe
exports.updatePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Le mot de passe actuel est requis'),

  body('newPassword')
    .notEmpty().withMessage('Le nouveau mot de passe est requis')
    .isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit avoir au moins 6 caractères')
];
