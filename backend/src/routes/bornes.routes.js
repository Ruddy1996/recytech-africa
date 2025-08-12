// src/routes/bornes.routes.js

const express = require('express');
const router = express.Router();
const bornesController = require('../controllers/bornes.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/authorize.middleware');
const validate = require('../middlewares/validate.middleware');
const borneSchema = require('../validators/borne.schema');


router.post('/', authenticateToken, authorizeRoles('Admin'), validate(borneSchema), bornesController.createBorne);
router.get('/', authenticateToken, authorizeRoles('Admin'), bornesController.getAllBornes);
router.get('/:id', authenticateToken, authorizeRoles('Admin'), bornesController.getBorneById);
router.put('/:id', authenticateToken, authorizeRoles('Admin'), validate(borneSchema), bornesController.updateBorne);
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), bornesController.deleteBorne);
router.get('/filter', authenticateToken, authorizeRoles('Admin'), bornesController.filterBornes);




module.exports = router;
