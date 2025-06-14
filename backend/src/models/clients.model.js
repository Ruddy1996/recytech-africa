const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const ClientsModel = {
  async getAll() {
    const result = await db.query('SELECT * FROM clients ORDER BY created_at DESC');
    return result.rows;
  },

  async getById(id) {
    const result = await db.query('SELECT * FROM clients WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create(data) {
    const id = uuidv4();
    const { nom, email, telephone, type, localisation } = data;
    const result = await db.query(
      `INSERT INTO clients (id, nom, email, telephone, type, localisation)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, nom, email, telephone, type, localisation]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const { nom, email, telephone, type, localisation } = data;
    const result = await db.query(
      `UPDATE clients
       SET nom = $1, email = $2, telephone = $3, type = $4, localisation = $5
       WHERE id = $6 RETURNING *`,
      [nom, email, telephone, type, localisation, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await db.query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};

module.exports = ClientsModel;
