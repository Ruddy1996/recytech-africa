// src/models/bornes_status.model.js
const db = require('../config/db');

const getBornesStatus = async (filters = {}) => {
  let query = 'SELECT * FROM v_bornes_status';
  const conditions = [];
  const values = [];

  if (filters.client_id) {
    values.push(filters.client_id);
    conditions.push(`client_id = $${values.length}`);
  }

  if (filters.statut) {
    values.push(filters.statut);
    conditions.push(`statut = $${values.length}`);
  }

  if (filters.type) {
    values.push(filters.type);
    conditions.push(`type = $${values.length}`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY last_recorded_at DESC NULLS LAST';

  const result = await db.query(query, values);
  return result.rows;
};

module.exports = {
  getBornesStatus,
};
