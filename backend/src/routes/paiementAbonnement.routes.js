const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/paiementAbonnement.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');


router.post('/init', authenticateToken, paiementController.initPaiement);

/* Webhook / retour CinetPay (⚠️  pas d’auth) */
router.post('/callback', paiementController.handleCallback);

/* Admin – listing / recherches */
router.get('/', authenticateToken, authorize('Admin'), paiementController.all);
router.get('/transaction/:transaction_id', authenticateToken, authorize('Admin'), paiementController.byTx);

/* Liste des paiements reliés à un abonnement (admin OU proprio) */
router.get('/abonnement/:abonnement_id', authenticateToken, paiementController.byAbonnement);

module.exports = router;
