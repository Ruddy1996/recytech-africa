/* src/routes/users.routes.js */
const express = require('express');
const router  = express.Router();

const userCtl          = require('../controllers/user.controller');
const { authenticateToken }  = require('../middlewares/auth.middleware');
const authorize              = require('../middlewares/authorize.middleware');

/* ───────────────────────── UTILISATEUR CONNECTÉ ───────────────────── */

/** Profil & édition  */
router.get ('/me', authenticateToken, userCtl.getProfile);
router.put ('/me', authenticateToken, userCtl.updateProfile);

/** Changer son mot de passe */
router.patch('/password', authenticateToken, userCtl.updatePassword);

/** Lier sa propre carte NFC (rôle user) */
router.post ('/me/link-nfc', authenticateToken, authorize('User'), userCtl.linkNFC);

/* ─────────── Réinitialisation mot de passe (public) ─────────── */
router.post('/reset-password',  userCtl.resetPassword);
router.put ('/update-password-token', userCtl.resetPasswordWithToken);


/* ─────────────────────────── ENDPOINTS ADMIN ───────────────────────── */
/* toutes les routes suivantes nécessitent le rôle Admin                */
router.use(authenticateToken, authorize('Admin'));

/** Liste + pagination  GET /api/users */
router.get   ('/',   authenticateToken, authorize('Admin'), userCtl.listUsers);

/** Création d’un compte  POST /api/users */
router.post  ('/', authenticateToken, authorize('Admin'), userCtl.createUser);

/** Activer / désactiver  PATCH /api/users/:id/active { active: true } */
router.patch ('/:id/active', authenticateToken, authorize('Admin'), userCtl.toggleActive);

/** Lier une carte NFC à n’importe quel utilisateur */
router.post  ('/:id/link-nfc', authenticateToken, authorize('Admin'), userCtl.linkNFC);

/** Suppression définitive */
router.delete('/:id', authenticateToken, authorize('Admin'), userCtl.deleteUser);

module.exports = router;
