// routes/stats.routes.js
const express = require('express');
const router = express.Router();
const StatsController = require('../controllers/stats.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');

// Stats globales (admin uniquement)
router.get('/global', authenticateToken, authorize('Admin'), StatsController.globalStats);

// Stats utilisateur (admin ou mobile user)
router.get('/users/:id', authenticateToken, StatsController.userStats);

// Stats bornes (admin)
router.get('/bornes', authenticateToken, authorize('Admin'), StatsController.statsParBorne);

// Stats dépôts (admin)
router.get('/par-jour', authenticateToken, authorize('Admin'), StatsController.depotsParJour);
router.get('/depot/:id', authenticateToken, authorize('Admin'), StatsController.depotDetails);


module.exports = router;
