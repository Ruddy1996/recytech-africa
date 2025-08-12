const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const DepotsModel = {
  async enregistrerDepot({ user_id, borne_id, poids, type_dechet, points }) {
    const id = uuidv4();
    const result = await db.query(
      `INSERT INTO depot_dechets (id, user_id, borne_id, poids, type_dechet, points)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, user_id, borne_id, poids, type_dechet, points]
    );
    return result.rows[0];
  },

  async getByUser(userId) {
  const result = await db.query(
    `SELECT * FROM depot_dechets WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
},

async getStatsByUser(userId) {
  const result = await db.query(
    `SELECT
        COUNT(*) AS total_depots,
        SUM(poids) AS total_poids,
        SUM(points) AS total_points,
        json_agg(json_build_object('type', type_dechet, 'poids', poids)) AS details
     FROM depot_dechets
     WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0];
},

};


module.exports = DepotsModel;
