/* src/models/interventions.model.js */
const db   = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/* Helpers ----------------------------------------------------------- */
const cols = `
  id, borne_id, type_intervention, description,
  date_intervention, intervenant, statut,
  created_at, updated_at
`;

/* CRUD -------------------------------------------------------------- */
async function create({
  borne_id,
  type_intervention,
  description,
  date_intervention,
  intervenant,
  statut = 'planifiee',
}) {
  const id = uuidv4();

  const { rows } = await db.query(
    `INSERT INTO interventions_borne
      (id, borne_id, type_intervention, description,
       date_intervention, intervenant, statut)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING ${cols}`,
    [id, borne_id, type_intervention, description,
     date_intervention, intervenant, statut]
  );
  return rows[0];
}

async function findAll({ page = 1, limit = 10, q, statut } = {}) {
  const off   = (page - 1) * limit;
  const conds = [];
  const vals  = [];

  /* filtre texte plein‑texte simple (description ou intervenant) */
  if (q) {
    vals.push(`%${q}%`);
    conds.push(`(description ILIKE $${vals.length} OR intervenant ILIKE $${vals.length})`);
  }
  if (statut && statut !== 'all') {
    vals.push(statut);
    conds.push(`statut = $${vals.length}`);
  }

  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';

  const data = await db.query(
    `SELECT ${cols}
       FROM interventions_borne
       ${where}
       ORDER BY date_intervention DESC
       LIMIT  $${vals.length + 1}
       OFFSET $${vals.length + 2}`,
    [...vals, limit, off]
  );

  const { rows: [{ count }] } = await db.query(
    `SELECT COUNT(*)::int AS count
       FROM interventions_borne
       ${where}`, vals
  );

  return { rows: data.rows, total: count };
}

async function findById(id) {
  const { rows } = await db.query(
    `SELECT ${cols} FROM interventions_borne WHERE id = $1`,
    [id]
  );
  return rows[0];
}

async function update(id, data) {
  const {
    borne_id, type_intervention, description,
    date_intervention, intervenant, statut,
  } = data;

  const { rows } = await db.query(
    `UPDATE interventions_borne SET
        borne_id          = COALESCE($2, borne_id),
        type_intervention = COALESCE($3, type_intervention),
        description       = COALESCE($4, description),
        date_intervention = COALESCE($5, date_intervention),
        intervenant       = COALESCE($6, intervenant),
        statut            = COALESCE($7, statut),
        updated_at        = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING ${cols}`,
    [id, borne_id, type_intervention, description,
     date_intervention, intervenant, statut]
  );
  return rows[0];
}

async function remove(id) {
  await db.query(`DELETE FROM interventions_borne WHERE id = $1`, [id]);
}

/* Pour la borne ou l’historique utilisateur ------------------------ */
async function byBorne(borneId) {
  const { rows } = await db.query(
    `SELECT ${cols}
       FROM interventions_borne
      WHERE borne_id = $1
      ORDER BY date_intervention DESC`,
    [borneId]
  );
  return rows;
}

module.exports = {
  create,
  findAll,
  findById,
  update,
  remove,
  byBorne,
};
