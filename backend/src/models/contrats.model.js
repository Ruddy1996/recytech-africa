/* src/models/contrats.model.js */
const db = require('../config/db');
const { v4: uuid }= require('uuid');

const ALLOWED_STATUS = ['en_cours', 'suspendu', 'termine'];   // ← ENUM logique

/* helper : construit la clause WHERE dynamiquement ---------------------- */
function buildWhere({ status, client_id, borne_id, q }, vals) {
  const conds = [];

  if (status && status !== 'all') {
    vals.push(status);                // $n
    conds.push(`statut = $${vals.length}`);
  }
  if (client_id) {
    vals.push(client_id);
    conds.push(`client_id = $${vals.length}`);
  }
  if (borne_id) {
    vals.push(borne_id);
    conds.push(`borne_id = $${vals.length}`);
  }
  if (q) {
    vals.push(`%${q}%`);
    conds.push(`CAST(montant AS TEXT) ILIKE $${vals.length}`); // recherche simple
  }
  return conds.length ? `WHERE ${conds.join(' AND ')}` : '';
}

/* ---------------------------------------------------------------------- */
const Contrat = {

  /* ► Liste paginée / filtrée */
  async list({ page = 1, limit = 10, ...filters }) {
    const vals  = [];
    const off   = (page - 1) * limit;
    const where = buildWhere(filters, vals);

    /* total pour pagination */
    const { rows: [{ count }] } = await db.query(
      `SELECT COUNT(*)::int AS count FROM contrats_location_bornes ${where}`,
      vals
    );

    /* page de résultats */
    vals.push(limit, off);            // ...,$n,$n+1
    const { rows } = await db.query(
      `SELECT id, borne_id, client_id,
              date_debut, date_fin,
              montant, statut,
              to_char(created_at,'YYYY-MM-DD') AS created_at
         FROM contrats_location_bornes
        ${where}
     ORDER BY created_at DESC
        LIMIT  $${vals.length - 1} OFFSET $${vals.length}`,
      vals
    );

    return { rows, total: count };
  },

  /* ► Création */
  async create({ borne_id, client_id, date_debut, date_fin, montant, statut = 'en_cours' }) {
    if (!ALLOWED_STATUS.includes(statut))
      throw new Error('Statut invalide');

    const { rows } = await db.query(
      `INSERT INTO contrats_location_bornes
        (id, borne_id, client_id, date_debut, date_fin, montant, statut)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [uuid(), borne_id, client_id, date_debut, date_fin, montant, statut]
    );
    return rows[0];
  },

  /* ► Change une partie ou l’ensemble */
  async update(id, data) {
    const sql = [];
    const vals = [];
    let i = 1;

    for (const [k, v] of Object.entries(data)) {
      if (k === 'statut' && !ALLOWED_STATUS.includes(v))
        throw new Error('Statut invalide');
      sql.push(`${k} = $${i++}`);
      vals.push(v);
    }
    vals.push(id);
    const { rows } = await db.query(
      `UPDATE contrats_location_bornes
          SET ${sql.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${i}
    RETURNING *`,
      vals
    );
    return rows[0];
  },

  /* ► Activer / Suspendre / Terminer juste le statut */
  async toggleStatus(id, statut) {
    if (!ALLOWED_STATUS.includes(statut))
      throw new Error('Statut invalide');

    const { rows } = await db.query(
      `UPDATE contrats_location_bornes
          SET statut = $1 , updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
    RETURNING id, statut`,
      [statut, id]
    );
    return rows[0];
  },

  /* ► Lecture simple / suppression */
  async getById(id) {
    const { rows } = await db.query(
      'SELECT * FROM contrats_location_bornes WHERE id = $1',
      [id]
    );
    return rows[0];
  },
  async remove(id) {
    await db.query('DELETE FROM contrats_location_bornes WHERE id = $1', [id]);
  },
};

module.exports = Contrat;
