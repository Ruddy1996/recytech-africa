// src/routes/alertes.routes.js
const express = require('express');
const router = express.Router();
const alerteController = require('../controllers/alertes.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/authorize.middleware');

router.get('/', authenticateToken, alerteController.getAlertes);
router.post('/', authenticateToken, alerteController.createAlerte);
router.patch('/:id/resolve', authenticateToken, authorizeRoles('Admin'), alerteController.resolveAlerte);

module.exports = router;
