// routes/stats.routes.js
const express = require('express');
const router = express.Router();
const StatsController = require('../controllers/stats.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');

// Stats globales (admin uniquement)
router.get('/global', authenticateToken, authorize('admin'), StatsController.globalStats);

// Stats utilisateur (admin ou mobile user)
router.get('/users/:id', authenticateToken, StatsController.userStats);

// Stats bornes (admin)
router.get('/bornes', authenticateToken, authorize('admin'), StatsController.statsParBorne);

// Stats dépôts (admin)
router.get('/par-jour', authenticateToken, authorize('admin'), StatsController.depotsParJour);
router.get('/depot/:id', authenticateToken, authorize('admin'), StatsController.depotDetails);


module.exports = router;
