const express = require('express');
const router = express.Router();
const AutoriteController = require('../controllers/autorite.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');

router.get('/rapports', authenticateToken, authorize('autorite'), AutoriteController.getRapports);
router.get('/stats', authenticateToken, authorize('autorite'), AutoriteController.getStats);

module.exports = router;
