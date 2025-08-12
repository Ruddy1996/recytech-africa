const express = require('express');
const router = express.Router();
const PaysController = require('../controllers/pays.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/authorize.middleware');

router.get('/', authenticateToken, authorizeRoles('Admin'), PaysController.getAll);
router.get('/:id', authenticateToken, authorizeRoles('Admin'), PaysController.getById);
router.post('/', authenticateToken, authorizeRoles('Admin'), PaysController.create);
router.put('/:id', authenticateToken, authorizeRoles('Admin'), PaysController.update);
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), PaysController.remove);

module.exports = router;
