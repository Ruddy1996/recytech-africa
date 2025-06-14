const express = require('express');
const router = express.Router();
const interventionsBorneController = require('../controllers/interventions.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/authorize.middleware');
const validate = require('../middlewares/validate.middleware');
const interventionSchema = require('../validators/intervention.schema');

// ➕ Créer une intervention
router.post('/', authenticateToken, authorizeRoles('admin'), validate(interventionSchema), interventionsBorneController.createInterventionBorne);

// 📄 Récupérer toutes les interventions
router.get('/', authenticateToken, authorizeRoles('admin'), interventionsBorneController.getAllInterventionsBorne);

// 🔍 Récupérer une intervention par ID
router.get('/:id', authenticateToken, authorizeRoles('admin'), interventionsBorneController.getInterventionBorneById);

// ✏️ Mettre à jour une intervention
router.put('/:id', authenticateToken, authorizeRoles('admin'), validate(interventionSchema), interventionsBorneController.updateInterventionBorne);

// 🗑️ Supprimer une intervention
router.delete('/:id', authenticateToken, authorizeRoles('admin'), interventionsBorneController.deleteInterventionBorne);

// 🔍 Récupérer toutes les interventions liées à une borne
router.get('/borne/:borneId', authenticateToken, authorizeRoles('admin'), interventionsBorneController.getInterventionsByBorneId);
router.get('/filter', authenticateToken, authorizeRoles('admin'), interventionsBorneController.getFilteredInterventions);

module.exports = router;
