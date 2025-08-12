// src/routes/bornesStatus.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const borneStatusController = require('../controllers/bornesStatus.controller');

router.get('/',authenticateToken, borneStatusController.getAllBornesStatus);
router.get('/', authenticateToken, borneStatusController.getBornesStatus);


module.exports = router;
