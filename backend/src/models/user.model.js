const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const QRCode = require('qrcode');


const User = {
  async create({ full_name, email, password, role }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const qr_code_id = uuidv4(); // ID unique

    // Générer le QR code sous forme de data URL
    const qr_code_data = await QRCode.toDataURL(qr_code_id);

    const result = await db.query(
    `INSERT INTO users (id, full_name, email, password, qr_code_id, qr_code_image, role)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, full_name, email, qr_code_id, qr_code_image, points, role`,
    [id, full_name, email, hashedPassword, qr_code_id, qr_code_data, role]
  );

    return result.rows[0];
},

  async findByEmail(email) {
    const result = await db.query(
      'SELECT id, email, password, full_name FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await db.query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async linkNFC(user_id, nfc_uid) {

    const existing = await db.query(
    `SELECT * FROM users WHERE nfc_uid = $1 AND id != $2`,
    [nfc_uid, user_id]
    );
    if (existing.rows.length > 0) {
      throw new Error('Cette carte NFC est déjà liée à un autre utilisateur.');
    }
    const result = await db.query(
        `UPDATE users SET nfc_uid = $1 WHERE id = $2 RETURNING *`,
        [nfc_uid, user_id]
    );
    return result.rows[0];
    },

  async update({ id, full_name, password }) {
    const result = await db.query(
      `UPDATE users
       SET full_name = $1, password = $2
       WHERE id = $3
       RETURNING id, full_name, email, qr_code_id, points`,
      [full_name, password, id]
    );
    return result.rows[0];
  }
};

module.exports = User;
