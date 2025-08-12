/* src/controllers/user.controller.js */
const User           = require('../models/user.model');
const pool           = require('../config/db');
const jwt            = require('jsonwebtoken');
const bcrypt         = require('bcrypt');
const sendMail       = require('../utils/sendMail');
const logUserAction  = require('../utils/logUserAction');

/* ──────────────────── helpers ──────────────────── */
const sanitize = (u) => {
  if (!u) return u;
  // eslint-disable-next-line no-unused-vars
  const { password, ...rest } = u;
  return rest;
};

/* ==================================================
   ███  SECTION PROFIL (utilisateur connecté)
   ================================================== */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(sanitize(user));
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.updateProfile = async (req, res) => {
  const { full_name, email } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    /* email déjà pris ? */
    if (email && email !== user.email) {
      const { rows } = await pool.query(
        `SELECT 1 FROM users WHERE email = $1 AND id <> $2`,
        [email, req.user.id]
      );
      if (rows.length) return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const updated = await User.update({
      id: req.user.id,
      full_name: full_name || user.full_name,
      email: email || user.email,
      password: user.password    // on ne touche pas au mdp ici
    });

    await logUserAction(req.user.id, 'UPDATE_PROFILE', {
      updatedFields: Object.keys(req.body)
    });

    res.json(sanitize(updated));
  } catch (e) {
    console.error('❌ updateProfile', e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/* ================= NFC (admin ou user) ================= */
exports.linkNFC = async (req, res) => {
  const { nfc_uid } = req.body;
  const targetId    = req.params.id || req.user.id; // admin => param, user => self
  try {
    const user = await User.linkNFC(targetId, nfc_uid);
    await logUserAction(req.user.id, 'LINK_NFC', { targetId, nfc_uid });
    res.json({ message: 'Carte NFC liée', user: sanitize(user) });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

/* ================= Mot de passe ================= */
exports.updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const { rows } = await pool.query(
      `SELECT password FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Utilisateur introuvable' });

    const ok = await bcrypt.compare(oldPassword, rows[0].password);
    if (!ok) return res.status(400).json({ message: 'Ancien mot de passe incorrect' });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE users SET password = $1 WHERE id = $2`, [hash, req.user.id]);

    await logUserAction(req.user.id, 'CHANGE_PASSWORD');
    res.json({ message: 'Mot de passe mis à jour' });
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/* ----- Réinitialisation par email (inchangé) ----- */
exports.resetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!rows.length) return res.status(404).json({ message: 'Aucun utilisateur trouvé' });

    const user = rows[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const link  = `http://localhost:5173/nouveau-mot-de-passe?token=${token}`;

    await sendMail({
      to: user.email,
      subject: '🔐 Réinitialisation de votre mot de passe',
      html: `
        <h2>Réinitialisation de mot de passe</h2>
        <p>Bonjour ${user.full_name || ''},</p>
        <p>Cliquez sur le lien ci‑dessous :</p>
        <a href="${link}" style="padding:10px 15px;background:#4CAF50;color:#fff;">Réinitialiser</a>
        <p>Ce lien expire dans 15 minutes.</p>`
    });

    res.json({ message: "Lien de réinitialisation envoyé" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.resetPasswordWithToken = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const hash  = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE users SET password=$1 WHERE id=$2`, [hash, id]);
    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (e) {
    res.status(400).json({ message: 'Token invalide ou expiré' });
  }
};

/* ==================================================
   ███  SECTION ADMIN
   ================================================== */

/** GET /api/admin/users  (pagination + recherche) */
exports.listUsers = async (req, res) => {
  const page   = parseInt(req.query.page  || 1, 10);
  const limit  = parseInt(req.query.limit || 10, 10);
  const offset = (page - 1) * limit;
  const q      = (req.query.q || '').trim().toLowerCase();

  /* ----- construction dynamique des clauses & paramètres ----- */
  const whereParts = [];
  const params     = [];

  if (q) {                       // ➜ $1
    params.push(`%${q}%`);
    whereParts.push(`(LOWER(full_name) LIKE $1 OR LOWER(email) LIKE $1)`);
  }
  const where = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

  /* ----- total ----- */
  const { rows: [{ count }] } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM users ${where}`,
    params
  );

  /* ----- page de résultats ----- */
  // limit & offset sont ajoutés APRES d’éventuels filtres
  const listParams = [...params, limit, offset];        // $n  … $n+1 $n+2
  const limitIdx   = params.length + 1;                 // pour l’injection
  const offsetIdx  = params.length + 2;

  const { rows } = await pool.query(
    `SELECT id, full_name, email, role, points,
            nfc_uid, is_active AS active, qr_code_image
     FROM   users ${where}
     ORDER  BY created_at DESC
     LIMIT  $${limitIdx} OFFSET $${offsetIdx}`,
    listParams
  );

  res.set('X-Total-Pages', Math.max(1, Math.ceil(count / limit)));
  res.json(rows);
};

/** POST /api/admin/users */
exports.createUser = async (req, res) => {
  const { full_name, email, password, role } = req.body;
  try {
    const data = await User.createAdmin({ full_name, email, password, role });
    await logUserAction(req.user.id, 'ADMIN_CREATE_USER', { target: data.id });
    res.status(201).json(data);
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: e.message });
  }
};

/** PATCH /api/admin/users/:id/active */
exports.toggleActive = async (req, res) => {
  const { id } = req.params;
  const { active } = req.body; // bool
  try {
    const data = await User.toggleActive(id, active);
    await logUserAction(req.user.id, 'ADMIN_TOGGLE_ACTIVE', { target: id, active });
    res.json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

/** DELETE /api/admin/users/:id */
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.remove(id);
    await logUserAction(req.user.id, 'ADMIN_DELETE_USER', { target: id });
    res.status(204).send();
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
