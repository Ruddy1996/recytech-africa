const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Créer un échange
const createEchange = async ({ user_id, recompense_id, statut = 'en_attente', details = null }) => {
  const id = uuidv4();
  const result = await pool.query(
    `INSERT INTO echanges_recompenses (id, user_id, recompense_id, statut, details)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [id, user_id, recompense_id, statut, details]
  );
  return result.rows[0];
};

// Récupérer tous les échanges avec nom utilisateur et titre récompense
const getAllEchanges = async () => {
  const result = await pool.query(
    `SELECT er.*, u.full_name, r.titre
     FROM echanges_recompenses er
     LEFT JOIN users u ON er.user_id = u.id
     LEFT JOIN recompenses r ON er.recompense_id = r.id
     ORDER BY er.date_echange DESC`
  );
  return result.rows;
};

// Récupérer un échange par ID
const getEchangeById = async (id) => {
  const result = await pool.query(
    `SELECT er.*, u.nom, u.prenom, r.titre
     FROM echanges_recompenses er
     LEFT JOIN users u ON er.user_id = u.id
     LEFT JOIN recompenses r ON er.recompense_id = r.id
     WHERE er.id = $1`,
    [id]
  );
  return result.rows[0];
};

// Récupérer les échanges d’un utilisateur spécifique
const getEchangesByUser = async (user_id) => {
  const result = await pool.query(
    `SELECT er.*, r.titre
     FROM echanges_recompenses er
     LEFT JOIN recompenses r ON er.recompense_id = r.id
     WHERE er.user_id = $1
     ORDER BY er.date_echange DESC`,
    [user_id]
  );
  return result.rows;
};

// Mettre à jour le statut + détails
const updateStatutEchange = async (id, statut, details = null) => {
  const result = await pool.query(
    `UPDATE echanges_recompenses
     SET statut = $1, details = $2
     WHERE id = $3 RETURNING *`,
    [statut, details, id]
  );
  return result.rows[0];
};

// Supprimer un échange
const deleteEchange = async (id) => {
  await pool.query(
    `DELETE FROM echanges_recompenses WHERE id = $1`,
    [id]
  );
};

module.exports = {
  createEchange,
  getAllEchanges,
  getEchangeById,
  getEchangesByUser,
  updateStatutEchange,
  deleteEchange,
};
