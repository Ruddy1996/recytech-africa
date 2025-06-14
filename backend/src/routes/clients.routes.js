const express = require('express');
const router = express.Router();
const ClientsController = require('../controllers/clients.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');

// CRUD clients
router.get('/', authenticateToken,authorize("admin"), ClientsController.getAll);
router.get('/:id', authenticateToken,authorize("admin"), ClientsController.getById);
router.post('/', authenticateToken,authorize("admin"), ClientsController.create);
router.put('/:id', authenticateToken,authorize("admin"), ClientsController.update);
router.delete('/:id', authenticateToken,authorize("admin"), ClientsController.delete);

module.exports = router;
