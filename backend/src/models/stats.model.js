const db = require('../config/db');

const StatsModel = {
  async getGlobalStats() {
    const result = await db.query(`
    SELECT
      -- Total utilisateurs
      (SELECT COUNT(*) FROM users) AS total_users,

      -- Total bornes
      (SELECT COUNT(*) FROM bornes) AS total_bornes,

      -- Dépôts
      (SELECT COUNT(*) FROM depot_dechets) AS total_depots,
      (SELECT COALESCE(SUM(poids), 0) FROM depot_dechets) AS total_poids,
      (SELECT COALESCE(SUM(points), 0) FROM depot_dechets) AS total_points
  `);

    return result.rows[0];
  },

  async getStatsByUser(userId) {
    const result = await db.query(`
      SELECT
        COUNT(*) AS total_depots,
        SUM(poids) AS total_poids,
        SUM(points) AS total_points,
        json_agg(json_build_object('type', type_dechet, 'poids', poids)) AS details
      FROM depot_dechets
      WHERE user_id = $1
    `, [userId]);
    return result.rows[0];
  },

  async getStatsParBorne() {
    const result = await db.query(`
      SELECT
        b.id AS borne_id,
        b.nom AS borne_nom,
        COUNT(d.id) AS nb_depots,
        SUM(d.poids) AS total_poids,
        SUM(d.points) AS total_points
      FROM bornes b
      LEFT JOIN depot_dechets d ON d.borne_id = b.id
      GROUP BY b.id
      ORDER BY nb_depots DESC
    `);
    return result.rows;
  },

  async getDepotsParJour() {
    const result = await db.query(`
      SELECT
        TO_CHAR(created_at::date, 'YYYY-MM-DD') AS date,
        COUNT(*) AS nb_depots,
        SUM(poids) AS total_poids,
        SUM(points) AS total_points
      FROM depot_dechets
      GROUP BY date
      ORDER BY date ASC
    `);
    return result.rows;
  },

  async getDepotDetailsById(id) {
    const result = await db.query(
      `SELECT d.*, u.full_name AS utilisateur, b.nom AS borne
       FROM depot_dechets d
       LEFT JOIN users u ON d.user_id = u.id
       LEFT JOIN bornes b ON d.borne_id = b.id
       WHERE d.id = $1`,
      [id]
    );
    return result.rows[0];
  },
  
};

module.exports = StatsModel;
