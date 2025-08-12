const db = require('../config/db');

const Recompense = {
  getAll: async () => {
    const { rows } = await db.query('SELECT * FROM recompenses ORDER BY created_at DESC');
    return rows;
  },

  getById: async (id) => {
    const { rows } = await db.query('SELECT * FROM recompenses WHERE id = $1', [id]);
    return rows[0];
  },

  create: async (data) => {
    const {
      id, titre, description, points_requis, image_url, stock,
      actif, type, categorie, partenaire, valid_from, valid_to
    } = data;

    const { rows } = await db.query(`
      INSERT INTO recompenses (
        id, titre, description, points_requis, image_url, stock,
        actif, type, categorie, partenaire, valid_from, valid_to
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
    `, [id, titre, description, points_requis, image_url, stock,
        actif ?? true, type, categorie, partenaire, valid_from, valid_to]);

    return rows[0];
  },

  update: async (id, data) => {
    const {
      titre, description, points_requis, image_url, stock,
      actif, type, categorie, partenaire, valid_from, valid_to
    } = data;

    const { rows } = await db.query(`
      UPDATE recompenses SET
        titre = $1,
        description = $2,
        points_requis = $3,
        image_url = $4,
        stock = $5,
        actif = $6,
        type = $7,
        categorie = $8,
        partenaire = $9,
        valid_from = $10,
        valid_to = $11
      WHERE id = $12
      RETURNING *
    `, [titre, description, points_requis, image_url, stock,
        actif, type, categorie, partenaire, valid_from, valid_to, id]);

    return rows[0];
  },

  delete: async (id) => {
    await db.query('DELETE FROM recompenses WHERE id = $1', [id]);
  }
};

module.exports = Recompense;
