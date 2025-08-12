const express = require('express');
const router = express.Router();
const quartierController = require('../controllers/quartier.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/authorize.middleware');

router.get('/', authenticateToken, authorizeRoles('Admin'), quartierController.getQuartiers);
router.get('/:id', authenticateToken, authorizeRoles('Admin'), quartierController.getQuartier);
router.post('/', authenticateToken, authorizeRoles('Admin'), quartierController.createQuartier);
router.put('/:id', authenticateToken, authorizeRoles('Admin'), quartierController.updateQuartier);
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), quartierController.deleteQuartier);

module.exports = router;
