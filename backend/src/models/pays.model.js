const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const getAllPays = async () => {
    const { rows } = await db.query('SELECT * FROM pays ORDER BY nom ASC');
    return rows;
};

const getPaysById = async (id) => {
    const { rows } = await db.query('SELECT * FROM pays WHERE id = $1', [id]);
    return rows[0];
};

const createPays = async (data) => {
    const id = uuidv4();
    const { code, nom, continent, actif } = data;
    const { rows } = await db.query(
        `INSERT INTO pays (id, code, nom, continent, actif, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
        [id, code, nom, continent, actif ?? true]
    );
    return rows[0];
};

const updatePays = async (id, data) => {
    const { code, nom, continent, actif } = data;
    const { rows } = await db.query(
        `UPDATE pays 
         SET code = $1, nom = $2, continent = $3, actif = $4
         WHERE id = $5
         RETURNING *`,
        [code, nom, continent, actif, id]
    );
    return rows[0];
};

const deletePays = async (id) => {
    await db.query('DELETE FROM pays WHERE id = $1', [id]);
    return { message: 'Pays supprimé avec succès' };
};

module.exports = {
    getAllPays,
    getPaysById,
    createPays,
    updatePays,
    deletePays
};
