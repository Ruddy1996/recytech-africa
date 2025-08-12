const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const getAllCommunes = async () => {
    const result = await db.query(
        `SELECT c.*, v.nom AS ville_nom 
         FROM communes c
         JOIN villes v ON v.id = c.ville_id
         ORDER BY c.created_at DESC`
    );
    return result.rows;
};

const getCommuneById = async (id) => {
    const result = await db.query(
        `SELECT c.*, v.nom AS ville_nom 
         FROM communes c
         JOIN villes v ON v.id = c.ville_id
         WHERE c.id = $1`, [id]
    );
    return result.rows[0];
};

const createCommune = async (data) => {
    const id = uuidv4();
    const { nom, ville_id, actif } = data;
    await db.query(
        `INSERT INTO communes (id, nom, ville_id, actif)
         VALUES ($1, $2, $3, $4)`,
        [id, nom, ville_id, actif ?? true]
    );
    return { id, ...data };
};

const updateCommune = async (id, data) => {
    const { nom, ville_id, actif } = data;
    await db.query(
        `UPDATE communes SET nom = $1, ville_id = $2, actif = $3
         WHERE id = $4`,
        [nom, ville_id, actif, id]
    );
    return { id, ...data };
};

const deleteCommune = async (id) => {
    await db.query(`DELETE FROM communes WHERE id = $1`, [id]);
    return { message: 'Commune supprimée avec succès' };
};

module.exports = {
    getAllCommunes,
    getCommuneById,
    createCommune,
    updateCommune,
    deleteCommune
};
