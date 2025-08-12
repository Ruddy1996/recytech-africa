const express = require('express');
const router = express.Router();

const echangeController = require('../controllers/echanges.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/authorize.middleware');

// ✅ Utilisateur : Créer un échange
router.post('/', authenticateToken, echangeController.creerEchange);

// ✅ Utilisateur : Voir ses échanges
router.get('/me', authenticateToken, echangeController.getMesEchanges);

// ✅ Admin : Voir tous les échanges
router.get('/', authenticateToken, authorizeRoles('Admin'), echangeController.getAllEchanges);

// ✅ Tous (admin ou user) : Voir un échange par ID
router.get('/:id', authenticateToken, echangeController.getEchangeById);

// ✅ Admin : Mettre à jour le statut d’un échange
router.patch('/:id/statut', authenticateToken, authorizeRoles('Admin'), echangeController.updateStatut);

// ✅ Admin : Valider un échange manuellement
router.patch('/:id/valider', authenticateToken, authorizeRoles('Admin'), echangeController.validerEchange);

// ✅ Admin : Supprimer un échange
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), echangeController.supprimerEchange);


module.exports = router;
