const express = require('express');
const router = express.Router();
const interventionsBorneController = require('../controllers/interventions.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/authorize.middleware');
const validate = require('../middlewares/validate.middleware');
const interventionSchema = require('../validators/intervention.schema');

// ➕ Créer une intervention
router.post('/', authenticateToken, authorizeRoles('Admin'), validate(interventionSchema), interventionsBorneController.create);

// 📄 Récupérer toutes les interventions
router.get('/', authenticateToken, authorizeRoles('Admin'), interventionsBorneController.list);

// 🔍 Récupérer une intervention par ID
router.get('/:id', authenticateToken, authorizeRoles('Admin'), interventionsBorneController.detail);

// ✏️ Mettre à jour une intervention
router.put('/:id', authenticateToken, authorizeRoles('Admin'), validate(interventionSchema), interventionsBorneController.update);

// 🗑️ Supprimer une intervention
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), interventionsBorneController.remove);

// 🔍 Récupérer toutes les interventions liées à une borne
router.get('/borne/:borneId', authenticateToken, authorizeRoles('Admin'), interventionsBorneController.byBorne);



module.exports = router;
