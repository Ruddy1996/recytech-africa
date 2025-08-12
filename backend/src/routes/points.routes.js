const express = require('express');
const router = express.Router();
const controller = require('../controllers/points.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');

// 📥 Effectuer une transaction manuelle (admin seulement)
router.post('/transaction', authenticateToken, authorize('Admin'), controller.transaction);

// 👤 Voir son propre historique
router.get('/me', authenticateToken, controller.getMonHistorique);

// 🧾 Voir tous les mouvements (admin)
router.get('/', authenticateToken, authorize('Admin'), controller.getAll);

module.exports = router;
