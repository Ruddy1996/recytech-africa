const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/authorize.middleware');

// Obtenir les infos du profil
router.get('/me', authenticateToken, userController.getProfile);

// Modifier son profil
router.put('/me', authenticateToken, userController.updateProfile);

// Lier une carte NFC
router.post('/link-nfc', authenticateToken, authorizeRoles('user'), userController.linkNFC);
router.put('/update-password', authenticateToken, userController.updatePassword);
router.post('/reset-password', userController.resetPassword);

module.exports = router;
