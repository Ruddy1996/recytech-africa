const express = require('express');
const router = express.Router();
const VillesController = require('../controllers/villes.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/authorize.middleware');

router.get('/', authenticateToken, authorizeRoles('Admin'), VillesController.getAll);
router.get('/:id', authenticateToken, authorizeRoles('Admin'), VillesController.getById);
router.get('/pays/:paysId', authenticateToken, authorizeRoles('Admin'), VillesController.getByPays);
router.post('/', authenticateToken, authorizeRoles('Admin'), VillesController.create);
router.put('/:id', authenticateToken, authorizeRoles('Admin'), VillesController.update);
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), VillesController.remove);

module.exports = router;
