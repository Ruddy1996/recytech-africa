// src/routes/plans.route.js
const express = require('express');
const router = express.Router();
const PlansController = require('../controllers/plans.controller');

const { authenticateToken } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');

// 📥 Créer un nouveau plan (admin uniquement)
router.post('/', authenticateToken, authorize('Admin'), PlansController.create);

// 📄 Récupérer tous les plans (public ou admin)
router.get('/', PlansController.getAll);

// 🔍 Récupérer un plan par ID
router.get('/:id', PlansController.getById);

module.exports = router;
