const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const getAllVilles = async () => {
    const { rows } = await db.query(
        `SELECT v.*, p.nom AS pays_nom, p.code AS pays_code
         FROM villes v
         JOIN pays p ON v.pays_id = p.id
         ORDER BY p.nom ASC, v.nom ASC`
    );
    return rows;
};

const getVillesById = async (id) => {
    const { rows } = await db.query(
        `SELECT v.*, p.nom AS pays_nom, p.code AS pays_code
         FROM villes v
         JOIN pays p ON v.pays_id = p.id
         WHERE v.id = $1`,
        [id]
    );
    return rows[0];
};

const getVillesByPays = async (paysId) => {
    const { rows } = await db.query(
        `SELECT * FROM villes WHERE pays_id = $1 ORDER BY nom ASC`,
        [paysId]
    );
    return rows;
};

const createVille = async (data) => {
    const id = uuidv4();
    const { pays_id, nom, code_postal, latitude, longitude, actif } = data;
    const { rows } = await db.query(
        `INSERT INTO villes (id, pays_id, nom, code_postal, latitude, longitude, actif, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING *`,
        [id, pays_id, nom, code_postal, latitude, longitude, actif ?? true]
    );
    return rows[0];
};

const updateVille = async (id, data) => {
    const { pays_id, nom, code_postal, latitude, longitude, actif } = data;
    const { rows } = await db.query(
        `UPDATE villes 
         SET pays_id = $1, nom = $2, code_postal = $3, latitude = $4, longitude = $5, actif = $6
         WHERE id = $7
         RETURNING *`,
        [pays_id, nom, code_postal, latitude, longitude, actif, id]
    );
    return rows[0];
};

const deleteVille = async (id) => {
    await db.query('DELETE FROM villes WHERE id = $1', [id]);
    return { message: 'Ville supprimée avec succès' };
};

module.exports = {
    getAllVilles,
    getVillesById,
    getVillesByPays,
    createVille,
    updateVille,
    deleteVille
};
