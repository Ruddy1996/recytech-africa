const db = require('../config/db');

const ContratModel = {
  async getAll() {
    const { rows } = await db.query('SELECT * FROM contrats_location_bornes ORDER BY created_at DESC');
    return rows;
  },

  async getById(id) {
    const { rows } = await db.query('SELECT * FROM contrats_location_bornes WHERE id = $1', [id]);
    return rows[0];
  },

  async create(data) {
    const { borne_id, client_id, date_debut, date_fin, montant, statut } = data;
    const { rows } = await db.query(
      `INSERT INTO contrats_location_bornes (borne_id, client_id, date_debut, date_fin, montant, statut)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [borne_id, client_id, date_debut, date_fin, montant, statut]
    );
    return rows[0];
  },

  async update(id, data) {
    const { borne_id, client_id, date_debut, date_fin, montant, statut } = data;
    const { rows } = await db.query(
      `UPDATE contrats_location_bornes
       SET borne_id = $1, client_id = $2, date_debut = $3, date_fin = $4, montant = $5, statut = $6
       WHERE id = $7
       RETURNING *`,
      [borne_id, client_id, date_debut, date_fin, montant, statut, id]
    );
    return rows[0];
  },

  async delete(id) {
    await db.query('DELETE FROM contrats_location_bornes WHERE id = $1', [id]);
  },
};

module.exports = ContratModel;
