// src/models/bornes.model.js
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// =============================
// GET ALL BORNES (avec localisation)
// =============================
const getAllBornes = async () => {
  const query = `
    SELECT 
      b.id, b.code, b.nom, b.type, b.statut, b.niveau_remplissage, b.humidite,
      b.mode_acquisition, b.date_installation, b.latitude, b.longitude,
      b.last_data_received_at, b.client_id, c.nom AS client_nom,
      q.id AS quartier_id, q.nom AS quartier_nom,
      com.id AS commune_id, com.nom AS commune_nom,
      v.id AS ville_id, v.nom AS ville_nom,
      p.id AS pays_id, p.nom AS pays_nom
    FROM bornes b
    LEFT JOIN clients c ON b.client_id = c.id
    LEFT JOIN quartiers q ON b.quartier_id = q.id
    LEFT JOIN communes com ON q.commune_id = com.id
    LEFT JOIN villes v ON com.ville_id = v.id
    LEFT JOIN pays p ON v.pays_id = p.id
    ORDER BY b.created_at DESC
  `;
  const result = await db.query(query);
  return result.rows;
};

// =============================
// GET BORNE BY ID
// =============================
const getBorneById = async (id) => {
  const query = `
    SELECT 
      b.id, b.code, b.nom, b.type, b.statut, b.niveau_remplissage, b.humidite,
      b.mode_acquisition, b.date_installation, b.latitude, b.longitude,
      b.last_data_received_at, b.client_id, c.nom AS client_nom,
      q.id AS quartier_id, q.nom AS quartier_nom,
      com.id AS commune_id, com.nom AS commune_nom,
      v.id AS ville_id, v.nom AS ville_nom,
      p.id AS pays_id, p.nom AS pays_nom
    FROM bornes b
    LEFT JOIN clients c ON b.client_id = c.id
    LEFT JOIN quartiers q ON b.quartier_id = q.id
    LEFT JOIN communes com ON q.commune_id = com.id
    LEFT JOIN villes v ON com.ville_id = v.id
    LEFT JOIN pays p ON v.pays_id = p.id
    WHERE b.id = $1
  `;
  const result = await db.query(query, [id]);
  return result.rows[0];
};

// =============================
// CREATE BORNE
// =============================
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
    client_id,
    quartier_id
  } = data;

  const result = await db.query(`
    INSERT INTO bornes (
      id, code, nom, type, statut, mode_acquisition,
      date_installation, latitude, longitude,
      niveau_remplissage, humidite, last_data_received_at,
      client_id, quartier_id
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9,
      $10, $11, $12,
      $13, $14
    ) RETURNING *
  `, [
    id, code, nom, type, statut, mode_acquisition,
    date_installation, latitude, longitude,
    niveau_remplissage, humidite, last_data_received_at,
    client_id, quartier_id
  ]);

  return result.rows[0];
};

// =============================
// UPDATE BORNE
// =============================
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

// =============================
// DELETE BORNE
// =============================
const deleteBorne = async (id) => {
  await db.query('DELETE FROM bornes WHERE id = $1', [id]);
};

// =============================
// FILTER BORNES (avec jointures)
// =============================
const filterBornes = async (filters) => {
  const conditions = [];
  const values = [];

  Object.entries(filters).forEach(([key, value], index) => {
    conditions.push(`${key} = $${index + 1}`);
    values.push(value);
  });

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT 
      b.id, b.code, b.nom, b.type, b.statut, b.niveau_remplissage, b.humidite,
      c.nom AS client_nom,
      q.nom AS quartier_nom,
      cm.nom AS commune_nom,
      v.nom AS ville_nom,
      p.nom AS pays_nom
    FROM bornes b
    LEFT JOIN clients c ON c.id = b.client_id
    LEFT JOIN quartiers q ON q.id = b.quartier_id
    LEFT JOIN communes cm ON cm.id = q.commune_id
    LEFT JOIN villes v ON v.id = cm.ville_id
    LEFT JOIN pays p ON p.id = v.pays_id
    ${whereClause}
    ORDER BY b.created_at DESC
  `;

  const result = await db.query(query, values);
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
