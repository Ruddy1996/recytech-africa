const express = require('express');
const router = express.Router();
const communeController = require('../controllers/commune.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/authorize.middleware');

router.get('/', authenticateToken, authorizeRoles('Admin'), communeController.getCommunes);
router.get('/:id', authenticateToken, authorizeRoles('Admin'), communeController.getCommune);
router.post('/', authenticateToken, authorizeRoles('Admin'), communeController.createCommune);
router.put('/:id', authenticateToken, authorizeRoles('Admin'), communeController.updateCommune);
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), communeController.deleteCommune);

module.exports = router;
