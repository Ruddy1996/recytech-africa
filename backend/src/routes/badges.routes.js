const express = require('express');
const router = express.Router();
const controller = require('../controllers/badges.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');

router.get('/me', authenticateToken, controller.getMesBadges);
router.get('/', controller.getAllBadges); // optionnel pour affichage public

// Routes admin
router.post('/', authenticateToken, authorize('Admin'), controller.creerBadge);
router.put('/:id', authenticateToken, authorize('Admin'), controller.updateBadge);
router.delete('/:id', authenticateToken, authorize('Admin'), controller.supprimerBadge);

module.exports = router;
