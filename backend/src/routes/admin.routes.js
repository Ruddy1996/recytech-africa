const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware'); // ✅ C'est ici l'erreur fréquente

// ✅ Assure-toi que cette ligne fonctionne bien :
router.get('/dashboard', authenticateToken, authorize('admin'), AdminController.getDashboard);
router.post('/create-user', authenticateToken, authorize('admin'), AdminController.createUser);
router.get('/users', authenticateToken, authorize('admin'), AdminController.getAllUsers);
router.delete('/user/:id', authenticateToken, authorize('admin'), AdminController.deleteUser);
router.patch('/user/:id/toggle-active', authenticateToken, authorize('admin'), AdminController.toggleUserActivation);


module.exports = router;
