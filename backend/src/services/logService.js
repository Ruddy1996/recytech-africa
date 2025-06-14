// services/logService.js
const db = require('../config/db'); // ton fichier de connexion pg
const { v4: uuidv4 } = require('uuid');

async function logToDatabase({ id = uuidv4(), user_id = null, action, metadata = {} }) {
  const query = `
    INSERT INTO user_logs (id, user_id, action, metadata, created_at)
    VALUES ($1, $2, $3, $4, NOW())
  `;

  const values = [id, user_id, action, metadata];

  try {
    await db.query(query, values);
  } catch (error) {
    console.error('Erreur lors de l’enregistrement du log BDD :', error.message);
  }
}

module.exports = {
  logToDatabase,
};
