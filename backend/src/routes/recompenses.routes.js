const express = require('express');
const router = express.Router();
const controller = require('../controllers/recompenses.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/authorize.middleware');

router.get('/', authenticateToken, authorizeRoles('Admin'), controller.getAll);
router.get('/:id', authenticateToken, authorizeRoles('Admin'), controller.getById);
router.post('/', authenticateToken, authorizeRoles('Admin'), controller.create);
router.put('/:id', authenticateToken, authorizeRoles('Admin'), controller.update);
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), controller.remove);

module.exports = router;
