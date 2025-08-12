const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const attribuerBadge = async (user_id, badge_id) => {
  const result = await pool.query(
    `INSERT INTO badges_users (user_id, badge_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, badge_id) DO NOTHING
     RETURNING *`,
    [user_id, badge_id]
  );
  return result.rows[0];
};

const getBadgesUtilisateur = async (user_id) => {
  const result = await pool.query(
    `SELECT bu.*, b.nom, b.description, b.image_url
     FROM badges_users bu
     JOIN badges b ON bu.badge_id = b.id
     WHERE bu.user_id = $1
     ORDER BY bu.date_attribue DESC`,
    [user_id]
  );
  return result.rows;
};

const getAllBadges = async () => {
  const result = await pool.query(`SELECT * FROM badges`);
  return result.rows;
};

// Créer un badge
const createBadge = async ({ nom, description, image_url, condition_type, condition_value }) => {
  const id = uuidv4();
  const result = await pool.query(
    `INSERT INTO badges (id, nom, description, image_url, condition_type, condition_value)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [id, nom, description, image_url, condition_type, condition_value]
  );
  return result.rows[0];
};

// Mettre à jour un badge
const updateBadge = async (id, updates) => {
  const fields = [];
  const values = [];
  let i = 1;

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = $${i++}`);
    values.push(value);
  }

  values.push(id);

  const result = await pool.query(
    `UPDATE badges SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  );
  return result.rows[0];
};

// Supprimer un badge
const deleteBadge = async (id) => {
  await pool.query(`DELETE FROM badges WHERE id = $1`, [id]);
};

module.exports = {
  attribuerBadge,
  getBadgesUtilisateur,
  getAllBadges,
  createBadge,
  updateBadge,
  deleteBadge,
};
