// src/models/bornes.model.js
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const getAllBornes = async () => {
  const result = await db.query('SELECT * FROM bornes ORDER BY created_at DESC');
  return result.rows;
};

const getBorneById = async (id) => {
  const result = await db.query('SELECT * FROM bornes WHERE id = $1', [id]);
  return result.rows[0];
};

const createBorne = async (data) => {
  const id = uuidv4();
  const {
    code,
    nom,
    type,
    statut = 'active',
    mode_acquisition,
    date_installation,
    latitude,
    longitude,
    niveau_remplissage,
    humidite,
    last_data_received_at,
    client_id
  } = data;

  const result = await db.query(`
    INSERT INTO bornes (
      id, code, nom, type, statut, mode_acquisition,
      date_installation, latitude, longitude,
      niveau_remplissage, humidite, last_data_received_at,
      client_id
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9,
      $10, $11, $12,
      $13
    ) RETURNING *
  `, [
    id, code, nom, type, statut, mode_acquisition,
    date_installation, latitude, longitude,
    niveau_remplissage, humidite, last_data_received_at,
    client_id
  ]);

  return result.rows[0];
};

const updateBorne = async (id, data) => {
  const fields = Object.keys(data);
  const values = Object.values(data);

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

  const query = `
    UPDATE bornes SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${fields.length + 1}
    RETURNING *
  `;

  const result = await db.query(query, [...values, id]);
  return result.rows[0];
};

const deleteBorne = async (id) => {
  await db.query('DELETE FROM bornes WHERE id = $1', [id]);
};

const filterBornes = async (filters) => {
  const conditions = [];
  const values = [];

  Object.entries(filters).forEach(([key, value], index) => {
    conditions.push(`${key} = $${index + 1}`);
    values.push(value);
  });

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await db.query(`SELECT * FROM bornes ${whereClause} ORDER BY created_at DESC`, values);
  return result.rows;
};


module.exports = {
  getAllBornes,
  getBorneById,
  createBorne,
  updateBorne,
  deleteBorne,
  filterBornes,

};
