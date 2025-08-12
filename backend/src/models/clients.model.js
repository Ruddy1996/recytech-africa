/* src/models/clients.model.js */
const db              = require('../config/db');
const { v4: uuidv4 }  = require('uuid');

/*───────────────────────────────────────────────────────────────────────────*/
/* Helpers ─ petit util pour construire les clauses WHERE dynamiques        */
function buildFilters({ q = '', type = 'all', telephone = '' }) {
  const conds = [];
  const vals  = [];
  let   idx   = 1;

  if (q) {
    conds.push(`(LOWER(nom) LIKE LOWER($${idx}) OR LOWER(email) LIKE LOWER($${idx}))`);
    vals.push(`%${q}%`);
    idx++;
  }
  if (type && type !== 'all') {
    conds.push(`type = $${idx}`);
    vals.push(type);
    idx++;
  }
  if (telephone) {
    conds.push(`telephone = $${idx}`);
    vals.push(telephone);
  }
  return { where: conds.length ? `WHERE ${conds.join(' AND ')}` : '', vals };
}

/*───────────────────────────────────────────────────────────────────────────*/
const Clients = {

  /* ► Liste paginée + filtre ------------------------------------------------*/
  async list({ page = 1, limit = 10, ...filters }) {
    const off        = (page - 1) * limit;
    const { where, vals } = buildFilters(filters);

    // total
    const { rows: [{ count }] } = await db.query(
      `SELECT COUNT(*)::int AS count FROM clients ${where}`, vals
    );

    // data
    const { rows } = await db.query(
      `SELECT id, nom, email, telephone, type, localisation,
              to_char(created_at,'YYYY-MM-DD') AS created_at
       FROM   clients
       ${where}
       ORDER  BY created_at DESC
       LIMIT  $${vals.length + 1} OFFSET $${vals.length + 2}`,
      [...vals, limit, off]
    );

    return { rows, total: count };
  },

  /* ► CRUD ------------------------------------------------------------------*/
  async create({ nom, email, telephone, type, localisation }) {
    const id   = uuidv4();
    const { rows } = await db.query(
      `INSERT INTO clients (id, nom, email, telephone, type, localisation)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [id, nom, email, telephone, type, localisation]
    );
    return rows[0];
  },

  async getById(id) {
    const { rows } = await db.query('SELECT * FROM clients WHERE id = $1', [id]);
    return rows[0];
  },

  async update(id, { nom, email, telephone, type, localisation }) {
    const { rows } = await db.query(
      `UPDATE clients
         SET nom=$1, email=$2, telephone=$3, type=$4, localisation=$5,
             updated_at = CURRENT_TIMESTAMP
       WHERE id=$6 RETURNING *`,
      [nom, email, telephone, type, localisation, id]
    );
    return rows[0];
  },

  async remove(id) {
    await db.query('DELETE FROM clients WHERE id=$1', [id]);
  }
};

module.exports = Clients;
