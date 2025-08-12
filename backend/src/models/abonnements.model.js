const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const createAbonnement = async (data) => {
  const id = uuidv4();
  const result = await pool.query(
    `INSERT INTO abonnements_dashboards (id, organisation_nom, organisation_type, email_contact, telephone_contact, date_fin, statut, plan_tarifaire, user_admin_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      id,
      data.organisation_nom,
      data.organisation_type,
      data.email_contact,
      data.telephone_contact,
      data.date_fin,
      data.statut || 'actif',
      data.plan_tarifaire,
      data.user_admin_id
    ]
  );
  return result.rows[0];
};

const getAllAbonnements = async () => {
  const result = await pool.query(`SELECT * FROM abonnements_dashboards ORDER BY created_at DESC`);
  return result.rows;
};

const getAbonnementByUserId = async (user_id) => {
  const result = await pool.query(
    `SELECT * FROM abonnements_dashboards WHERE user_admin_id = $1`,
    [user_id]
  );
  return result.rows;
};

module.exports = {
  createAbonnement,
  getAllAbonnements,
  getAbonnementByUserId
};
