const express = require('express');
const router = express.Router();
const controller = require('../controllers/notifications.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');

router.get('/me', authenticateToken, controller.getMesNotifications);
router.patch("/lire-tout", authenticateToken, controller.marquerToutesCommeLues
);

router.patch('/:id/lire', authenticateToken, controller.marquerCommeLue);
router.get('/', authenticateToken, authorize('Admin'),  controller.getAllNotifications);

module.exports = router;
