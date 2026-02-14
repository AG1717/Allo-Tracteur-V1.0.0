const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  updatePassword,
  forgotPassword
} = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth');

// Routes publiques
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// Routes protégées
router.get('/me', auth, getMe);
router.post('/logout', auth, logout);
router.put('/update-password', auth, updatePassword);

module.exports = router;
