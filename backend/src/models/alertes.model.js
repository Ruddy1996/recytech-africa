// src/models/alertes.model.js
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const createAlerte = async (data) => {
  const id = uuidv4();
  const {
    borne_id,
    type_alerte,
    message,
    niveau = 'info',
  } = data;

  const result = await db.query(`
    INSERT INTO borne_alertes (
      id, borne_id, type_alerte, message, niveau
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [id, borne_id, type_alerte, message, niveau]);

  return result.rows[0];
};

const getAlertes = async (filtreStatut = null) => {
  let query = `SELECT * FROM borne_alertes`;
  const values = [];

  if (filtreStatut === 'actif') {
    query += ` WHERE est_resolue = FALSE`;
  } else if (filtreStatut === 'resolu') {
    query += ` WHERE est_resolue = TRUE`;
  }

  query += ` ORDER BY created_at DESC`;

  const result = await db.query(query, values);
  return result.rows;
};

const getAlerteById = async (id) => {
  const result = await db.query('SELECT * FROM borne_alertes WHERE id = $1', [id]);
  return result.rows[0];
};

const resolveAlerte = async (id) => {
  const userId = req.user?.id || null;
  const result = await db.query(`
    UPDATE borne_alertes
    SET est_resolue = TRUE,
        resolved_at = CURRENT_TIMESTAMP,
        resolved_by = $2
    WHERE id = $1
    RETURNING *
  `, [id, userId]);
    return result.rows[0];
};

module.exports = {
  createAlerte,
  getAlertes,
  getAlerteById,
  resolveAlerte,
};
