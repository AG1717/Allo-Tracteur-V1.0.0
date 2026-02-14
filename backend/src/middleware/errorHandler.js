// Gestion centralisée des erreurs

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Erreur de développement : afficher tous les détails
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      stack: err.stack,
      details: err,
    });
  }

  // Erreur de production : ne pas exposer les détails internes
  
  // Erreur Mongoose : CastError (ID invalide)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Ressource non trouvée',
    });
  }

  // Erreur Mongoose : Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: `Cette valeur de ${field} existe déjà`,
    });
  }

  // Erreur Mongoose : Validation
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: errors.join(', '),
    });
  }

  // Erreur opérationnelle connue
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Erreur inconnue
  console.error('ERREUR:', err);
  return res.status(500).json({
    success: false,
    error: 'Une erreur est survenue',
  });
};

module.exports = { AppError, errorHandler };
