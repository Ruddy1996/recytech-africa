const express = require('express');
const router = express.Router();
const controller = require('../controllers/contrats.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/authorize.middleware');

router.get('/', authenticateToken,authorize("admin"), controller.getAll);
router.get('/:id', authenticateToken,authorize("admin"), controller.getById);
router.post('/', authenticateToken,authorize("admin"), controller.create);
router.put('/:id', authenticateToken,authorize("admin"), controller.update);
router.delete('/:id', authenticateToken,authorize("admin"), controller.delete);

module.exports = router;
