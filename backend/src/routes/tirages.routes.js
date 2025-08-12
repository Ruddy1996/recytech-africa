const express = require('express');
const router = express.Router();
const tirageController = require('../controllers/tirages.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');


router.get('/public',  tirageController.list);  // ?actif=true&q=...

/* -------- Utilisateur connecté -------- */
router.post('/:id/participer', authenticateToken, tirageController.participate);

/* -------- Admin -------- */
router.post('/', authenticateToken, authorize('Admin'), tirageController.create);
router.get('/', authenticateToken, authorize('Admin'), tirageController.list);
router.patch('/:id/actif', authenticateToken, authorize('Admin'), tirageController.toggleActif);
router.post('/:id/draw', authenticateToken, authorize('Admin'), tirageController.draw);


module.exports = router;
