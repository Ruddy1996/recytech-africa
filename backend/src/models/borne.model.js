// src/models/borne.model.js
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { sendToClients } = require('../sockets/io');
const { calculCO2Evite } = require('../sockets/co2');

// =============================
// GET ALL BORNES (avec localisation + CO2)
// =============================
const getAllBornes = async () => {
  const query = `
    SELECT 
      b.id, b.code, b.nom, b.type, b.statut, b.niveau_remplissage, b.humidite,
      b.mode_acquisition, b.date_installation, b.latitude, b.longitude,
      b.temperature, b.battery_level, 
      b.poids_depose, b.type_dechet, b.co2_evite,
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
      b.temperature, b.battery_level,
      b.poids_depose, b.type_dechet, b.co2_evite,
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
    temperature,
    battery_level,
    niveau_remplissage,
    humidite,
    poids_depose = 0,
    type_dechet = null,
    co2_evite = 0,
    last_data_received_at,
    client_id,
    quartier_id
  } = data;

  const result = await db.query(`
    INSERT INTO bornes (
      id, code, nom, type, statut, mode_acquisition,
      date_installation, latitude, longitude,
      temperature, battery_level,
      niveau_remplissage, humidite, poids_depose, type_dechet, co2_evite,
      last_data_received_at, client_id, quartier_id
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9,
      $10, $11, $12,
      $13, $14, $15, $16,
      $17, $18, $19
    ) RETURNING *
  `, [
    id, code, nom, type, statut, mode_acquisition,
    date_installation, latitude, longitude,
    temperature, battery_level,
    niveau_remplissage, humidite, poids_depose, type_dechet, co2_evite,
    last_data_received_at, client_id, quartier_id
  ]);

  const newBorne = result.rows[0];
  sendToClients('BORNE_CREATED', newBorne);
  return newBorne;
};

// =============================
// UPDATE BORNE (par ID)
// =============================
const updateBorne = async (id, data) => {
  const allowedFields = [
    'code',
    'nom',
    'type',
    'statut',
    'niveau_remplissage',
    'humidite',
    'client_id',
    'quartier_id',
    'latitude',
    'longitude',
    'temperature',
    'battery_level',
    'poids_depose',
    'type_dechet',
    'co2_evite',
    'last_data_received_at'
  ];

  const fields = Object.keys(data).filter(field => allowedFields.includes(field));
  const values = fields.map(field => data[field]);

  if (fields.length === 0) {
    throw new Error('Aucun champ valide fourni pour la mise à jour');
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

  const query = `
    UPDATE bornes SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${fields.length + 1}
    RETURNING *
  `;

  const result = await db.query(query, [...values, id]);
  const updatedBorne = result.rows[0];

  // Recalcul CO2 si nécessaire
  if (updatedBorne.poids_depose && updatedBorne.type_dechet) {
    updatedBorne.co2_evite = calculCO2Evite(updatedBorne.type_dechet, updatedBorne.poids_depose);
  } else {
    updatedBorne.co2_evite = 0;
  }

  sendToClients('BORNE_UPDATED', updatedBorne);
  return updatedBorne;
};

// =============================
// UPDATE BORNE BY CODE
// =============================
const updateBorneByCode = async (code, data) => {
  const allowedFields = [
    'latitude',
    'longitude',
    'temperature',
    'battery_level',
    'niveau_remplissage',
    'humidite',
    'poids_depose',
    'type_dechet',
    'co2_evite',
    'last_data_received_at'
  ];

  const fields = Object.keys(data).filter(field => allowedFields.includes(field));
  const values = fields.map(field => data[field]);

  if (fields.length === 0) return null;

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

  const query = `
    UPDATE bornes SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE code = $${fields.length + 1}
    RETURNING *
  `;

  const result = await db.query(query, [...values, code]);
  const updatedBorne = result.rows[0];

  if (updatedBorne) sendToClients('BORNE_UPDATED', updatedBorne);
  return updatedBorne;
};

// =============================
// DELETE BORNE
// =============================
const deleteBorne = async (id) => {
  await db.query('DELETE FROM bornes WHERE id = $1', [id]);
  sendToClients('BORNE_DELETED', { id });
};

// =============================
// FILTER BORNES (avec pagination)
// =============================
const filterBornes = async (filters, limit = 10, offset = 0) => {
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
      b.poids_depose, b.type_dechet, b.co2_evite,
      c.nom AS client_nom,
      q.nom AS quartier_nom,
      cm.nom AS commune_nom,
      v.nom AS ville_nom,
      p.nom AS pays_nom
    FROM bornes b
    LEFT JOIN clients c ON c.id = b.client_id
    LEFT JOIN quartiers q ON q.id = b.quartier_id
    LEFT JOIN communes cm ON q.commune_id = cm.id
    LEFT JOIN villes v ON cm.ville_id = v.id
    LEFT JOIN pays p ON v.pays_id = p.id
    ${whereClause}
    ORDER BY b.created_at DESC
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM bornes b
    ${whereClause}
  `;

  const rowsResult = await db.query(query, [...values, limit, offset]);
  const countResult = await db.query(countQuery, values);

  return {
    rows: rowsResult.rows,
    count: parseInt(countResult.rows[0].total, 10)
  };
};

module.exports = {
  getAllBornes,
  getBorneById,
  createBorne,
  updateBorne,
  updateBorneByCode,
  deleteBorne,
  filterBornes
};
