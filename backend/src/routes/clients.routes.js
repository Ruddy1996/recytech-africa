/* src/routes/clients.routes.js */
const express            = require('express');
const router             = express.Router();

const ClientsController  = require('../controllers/clients.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorize            = require('../middlewares/authorize.middleware'); // Autorise « Admin »

/* ─────────── CRUD + liste paginée ─────────── */

/** GET /api/clients?page=&limit=&q=&type=&telephone=  */
router.get(
  '/',
  authenticateToken,
  authorize('Admin'),
  ClientsController.list        // pagination + recherche
);

/** GET /api/clients/:id */
router.get(
  '/:id',
  authenticateToken,
  authorize('Admin'),
  ClientsController.getById
);

/** POST /api/clients */
router.post(
  '/',
  authenticateToken,
  authorize('Admin'),
  ClientsController.create
);

/** PUT /api/clients/:id */
router.put(
  '/:id',
  authenticateToken,
  authorize('Admin'),
  ClientsController.update
);

/** DELETE /api/clients/:id */
router.delete(
  '/:id',
  authenticateToken,
  authorize('Admin'),
  ClientsController.remove
);

module.exports = router;
