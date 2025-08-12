const db = require('../config/db');

const IdentificationController = {
  async getUserByNfc(req, res) {
    const uid = req.params.uid;
    const result = await db.query('SELECT * FROM users WHERE nfc_uid = $1', [uid]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Carte NFC non reconnue" });
    }
    res.json(result.rows[0]);
  },

  async getUserByQrCode(req, res) {
    const qr_id = req.params.qr_code_id;
    const result = await db.query('SELECT * FROM users WHERE qr_code_id = $1', [qr_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "QR code non reconnu" });
    }
    res.json(result.rows[0]);
  }
};

module.exports = IdentificationController;
