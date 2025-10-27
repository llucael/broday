const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateLogin,
  validatePasswordUpdate
} = require('../middleware/validation');

// Rotas públicas
router.post('/register', validateUserRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/verify-email/request', authController.requestEmailVerification);
router.post('/verify-email/verify', authController.verifyEmailCode);

// Rotas protegidas
router.use(authenticateToken); // Todas as rotas abaixo precisam de autenticação

router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.put('/change-password', validatePasswordUpdate, authController.changePassword);
router.post('/logout', authController.logout);

module.exports = router;
