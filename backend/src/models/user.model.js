/* src/models/user.model.js */
const db          = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt      = require('bcrypt');
const QRCode      = require('qrcode');

/* -------- Helpers -------- */
async function genQr() {
  const qr_id  = uuidv4();
  const qr_img = await QRCode.toDataURL(qr_id);
  return { qr_id, qr_img };
}

/* ============================================================= */
const User = {
  /* =======================  ADMIN  =========================== */

  /** ► GET – liste paginée + recherche + filtre rôle */
  async list({ page = 1, limit = 10, role, q }) {
    const offset = (page - 1) * limit;
    const conds  = [];
    const vals   = [];

    if (role && role !== 'all') {
      vals.push(role);
      conds.push(`role = $${vals.length}`);
    }
    if (q) {
      vals.push(`%${q}%`);
      conds.push(
        `(full_name ILIKE $${vals.length} OR email ILIKE $${vals.length})`
      );
    }

    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

    /* ---- total ---- */
    const { rows: totalRows } = await db.query(
      `SELECT COUNT(*) FROM users ${where}`,
      vals
    );
    const total = Number(totalRows[0].count);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    /* ---- data paginée ---- */
    const dataVals = [...vals, limit, offset];
    const limitIdx  = vals.length + 1;
    const offsetIdx = vals.length + 2;

    const { rows } = await db.query(
      `SELECT id, full_name, email, role, points,
              is_active AS active, nfc_uid,
              qr_code_image,
              to_char(created_at,'YYYY-MM-DD') AS created_at
       FROM   users ${where}
       ORDER  BY created_at DESC
       LIMIT  $${limitIdx} OFFSET $${offsetIdx}`,
      dataVals
    );

    return { rows, totalPages };
  },

  /** ► POST – création par un admin */
  async createAdmin({ full_name, email, password, role = 'User' }) {
    const id   = uuidv4();
    const hash = await bcrypt.hash(password, 10);
    const { qr_id, qr_img } = await genQr();

    const { rows } = await db.query(
      `INSERT INTO users (id, full_name, email, password,
                          qr_code_id, qr_code_image, role)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, full_name, email, role, points,
                 qr_code_image, is_active AS active`,
      [id, full_name, email, hash, qr_id, qr_img, role]
    );
    return rows[0];
  },

  /** ► PATCH – activer / désactiver un compte */
  async toggleActive(id, isActive) {
    const { rows } = await db.query(
      `UPDATE users
         SET is_active = $1,
             updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, is_active AS active`,
      [isActive, id]
    );
    return rows[0];
  },

  /** ► DELETE – supprimer définitivement */
  async remove(id) {
    await db.query('DELETE FROM users WHERE id = $1', [id]);
  },

  /* ====================  UTILISATEUR  ======================== */

  /** inscription standard */
  async create({ full_name, email, password, role = 'User' }) {
    const id   = uuidv4();
    const hash = await bcrypt.hash(password, 10);
    const { qr_id, qr_img } = await genQr();

    const { rows } = await db.query(
      `INSERT INTO users (id, full_name, email, password,
                          qr_code_id, qr_code_image, role)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, full_name, email, qr_code_id,
                 qr_code_image, points, role`,
      [id, full_name, email, hash, qr_id, qr_img, role]
    );
    return rows[0];
  },

  async findByEmail(email) {
  // on récupère explicitement is_active et password
  const { rows } = await db.query(
    `SELECT id,
            email,
            full_name,
            role,
            password,
            is_active          -- 👈 I M P O R T A N T
       FROM users
      WHERE email = $1`,
    [email]
  );
  return rows[0];
},
  async findById(id) {
    const { rows } = await db.query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );
    return rows[0];
  },

  /** ► Lier / modifier l’UID NFC */
  async linkNFC(user_id, nfc_uid) {
    const { rows: dup } = await db.query(
      `SELECT 1 FROM users WHERE nfc_uid = $1 AND id <> $2`,
      [nfc_uid, user_id]
    );
    if (dup.length)
      throw new Error('Cette carte NFC est déjà liée à un autre utilisateur.');

    const { rows } = await db.query(
      `UPDATE users
         SET nfc_uid = $1
       WHERE id = $2
       RETURNING id, full_name, email, nfc_uid`,
      [nfc_uid, user_id]
    );
    return rows[0];
  },

  /** ► PATCH – mise à jour profil (nom / email / mdp) */
  async update({ id, full_name, email, password }) {
    const { rows } = await db.query(
      `UPDATE users
         SET full_name = $1,
             email      = $2,
             password   = $3,
             updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, full_name, email,
                 qr_code_id, qr_code_image,
                 points, role`,
      [full_name, email, password, id]
    );
    return rows[0];
  }
};

module.exports = User;
