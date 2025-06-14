const express = require('express');

const router = express.Router();
const logController = require('../controllers/log.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/authorize.middleware');

// Middleware : accessible seulement aux admins
router.get('/', authenticateToken, authorizeRoles('admin'), logController.getLogs);

module.exports = router;
