const express = require('express');
const router = express.Router();
const DepotsController = require('../controllers/depots.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

router.post('/', DepotsController.enregistrerDepot); // pas besoin d’auth car borne communique
router.get('/user/:id', authenticateToken, DepotsController.getByUser); // pour les stats mobiles
router.get('/user/:id/stats', authenticateToken, DepotsController.getStatsByUser); // cumul mobile + admin


module.exports = router;
