const express = require('express');
const router = express.Router();
const controller = require('../controllers/contrats.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');

router.get('/', authenticateToken,authorize("Admin"), controller.list);
router.get('/:id', authenticateToken,authorize("Admin"), controller.get);
router.post('/', authenticateToken,authorize("Admin"), controller.create);
router.put('/:id', authenticateToken,authorize("Admin"), controller.update);
router.put('/:id/status', authenticateToken,authorize("Admin"), controller.toggleStatus);
router.delete('/:id', authenticateToken,authorize("Admin"), controller.remove);


module.exports = router;
