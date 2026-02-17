const User = require('../models/User');
const { ErrorResponse } = require('../middleware/errorHandler');

// @desc    Inscription
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { nom, prenom, email, telephone, password, role, adminSecretCode } = req.body;

    // Vérifier si quelqu'un essaie de créer un compte admin
    if (role === 'admin') {
      // Vérifier le code secret admin
      if (!adminSecretCode || adminSecretCode !== process.env.ADMIN_SECRET_CODE) {
        return res.status(403).json({
          success: false,
          message: 'Code secret admin invalide. Vous ne pouvez pas créer de compte administrateur.'
        });
      }
    }

    // Vérifier si l'utilisateur existe déjà
    const orConditions = [{ telephone }];
    if (email) {
      orConditions.push({ email });
    }
    const existingUser = await User.findOne({ $or: orConditions });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un compte avec cet email ou ce téléphone existe déjà'
      });
    }

    // Créer l'utilisateur (par défaut client si pas de rôle spécifié)
    const userData = {
      nom,
      prenom,
      telephone,
      password,
      role: role || 'client'
    };
    if (email) {
      userData.email = email;
    }
    const user = await User.create(userData);

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Connexion
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, telephone, password } = req.body;

    // Vérifier qu'on a email/telephone et password
    if ((!email && !telephone) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email/téléphone et un mot de passe'
      });
    }

    // Trouver l'utilisateur
    const loginConditions = [];
    if (email) loginConditions.push({ email });
    if (telephone) loginConditions.push({ telephone });
    const user = await User.findOne({
      $or: loginConditions
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Vérifier le mot de passe
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Votre compte a été désactivé'
      });
    }

    // Mettre à jour lastLogin
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Déconnexion
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Déconnexion réussie',
    data: {}
  });
};

// @desc    Mettre à jour le mot de passe
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Vérifier le mot de passe actuel
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Mot de passe oublié
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email, telephone } = req.body;

    const user = await User.findOne({
      $or: [{ email }, { telephone }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Aucun utilisateur trouvé avec ces informations'
      });
    }

    // TODO: Générer un token et envoyer par email/SMS
    // Pour l'instant, on simule
    res.status(200).json({
      success: true,
      message: 'Instructions envoyées par email/SMS'
    });
  } catch (error) {
    next(error);
  }
};

// Fonction helper pour envoyer la réponse avec token
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  // Retirer le mot de passe de la réponse
  const userData = user.toObject();
  delete userData.password;

  res.status(statusCode).json({
    success: true,
    token,
    data: userData
  });
};
