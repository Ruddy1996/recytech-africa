// utils/logUserAction.js
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db'); 
const logger = require('./logger');

async function logUserAction(userId, action, metadata = {}) {
  const id = uuidv4();
  const query = `
    INSERT INTO user_logs (id, user_id, action, metadata)
    VALUES ($1, $2, $3, $4)
  `;
  try {
    await db.query(query, [id, userId, action, metadata]);
    logger.info(`Action: ${action} | User: ${userId} | Metadata: ${JSON.stringify(metadata)}`);
  } catch (error) {
    logger.error(`Erreur lors du log de l'action: ${action} - ${error.message}`);
  }
}

module.exports = logUserAction;

