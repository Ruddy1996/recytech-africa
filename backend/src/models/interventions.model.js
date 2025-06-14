const db = require('../config/db');

// CREATE
const create = async ({
  borne_id,
  type_intervention,
  description,
  date_intervention,
  intervenant,
  statut = 'planifiee'
}) => {
  const { rows } = await pool.query(
    `SELECT * FROM create_intervention_borne($1, $2, $3, $4, $5, $6)`,
    [borne_id, type_intervention, description, date_intervention, intervenant, statut]
  );
  return rows[0];
};

// GET ALL
const findAll = async () => {
  const { rows } = await pool.query(`SELECT * FROM get_all_interventions_borne()`);
  return rows;
};

// GET BY ID
const findById = async (id) => {
  const { rows } = await pool.query(`SELECT * FROM get_intervention_borne_by_id($1)`, [id]);
  return rows[0];
};

// UPDATE
const update = async (id, {
  borne_id,
  type_intervention,
  description,
  date_intervention,
  intervenant,
  statut
}) => {
  const { rows } = await pool.query(
    `SELECT * FROM update_intervention_borne($1, $2, $3, $4, $5, $6, $7)`,
    [id, borne_id, type_intervention, description, date_intervention, intervenant, statut]
  );
  return rows[0];
};

// DELETE
const remove = async (id) => {
  await pool.query(`SELECT delete_intervention_borne($1)`, [id]);
};

module.exports = {
  create,
  findAll,
  findById,
  update,
  remove
};
