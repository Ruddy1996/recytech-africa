const express = require('express');
const router = express.Router();
const controller = require('../controllers/abonnements.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');

// 📦 Accès public
router.get('/plans', controller.getPlans);

// 🔐 Abonnement par un utilisateur authentifié
router.post('/', authenticateToken, controller.creerAbonnement);
router.get('/me', authenticateToken, controller.getMesAbonnements);

// 🔐 Accès admin à tous les abonnements
router.get('/', authenticateToken, authorize('admin'), controller.getAllAbonnements);

module.exports = router;
