const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const createPlan = async ({ nom, description, prix_mensuel, nb_utilisateurs, acces_data, acces_alertes, acces_export }) => {
  const id = uuidv4();
  const result = await pool.query(
    `INSERT INTO plans_tarifaires 
     (id, nom, description, prix_mensuel, nb_utilisateurs, acces_data, acces_alertes, acces_export)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [id, nom, description, prix_mensuel, nb_utilisateurs, acces_data, acces_alertes, acces_export]
  );
  return result.rows[0];
};

const getAllPlans = async () => {
  const result = await pool.query(`SELECT * FROM plans_tarifaires ORDER BY prix_mensuel ASC`);
  return result.rows;
};

const getPlanById = async (id) => {
  const result = await pool.query(`SELECT * FROM plans_tarifaires WHERE id = $1`, [id]);
  return result.rows[0];
};

module.exports = {
  createPlan,
  getAllPlans,
  getPlanById
};
