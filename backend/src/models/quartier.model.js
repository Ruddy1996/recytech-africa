const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const getAllQuartiers = async () => {
  const result = await db.query(`
    SELECT q.*, c.nom AS commune_nom
    FROM quartiers q
    JOIN communes c ON q.commune_id = c.id
    ORDER BY q.nom
  `);
  return result.rows;
};

const getQuartierById = async (id) => {
  const result = await db.query(
    `SELECT q.*, c.nom AS commune_nom
     FROM quartiers q
     JOIN communes c ON q.commune_id = c.id
     WHERE q.id = $1`,
    [id]
  );
  return result.rows[0];
};

const createQuartier = async (data) => {
  const id = uuidv4();
  const { nom, commune_id, actif } = data;
  await db.query(
    `INSERT INTO quartiers (id, nom, commune_id, actif)
     VALUES ($1, $2, $3, $4)`,
    [id, nom, commune_id, actif ?? true]
  );
  return { id, ...data };
};

const updateQuartier = async (id, data) => {
  const { nom, commune_id, actif } = data;
  await db.query(
    `UPDATE quartiers
     SET nom = $1, commune_id = $2, actif = $3
     WHERE id = $4`,
    [nom, commune_id, actif, id]
  );
  return { id, ...data };
};

const deleteQuartier = async (id) => {
  await db.query(`DELETE FROM quartiers WHERE id = $1`, [id]);
};

module.exports = {
  getAllQuartiers,
  getQuartierById,
  createQuartier,
  updateQuartier,
  deleteQuartier
};
