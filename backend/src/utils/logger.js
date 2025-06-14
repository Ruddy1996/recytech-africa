// utils/logger.js
const { createLogger, format, transports } = require('winston');
const { v4: uuidv4 } = require('uuid');
const { logToDatabase } = require('../services/logService');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.simple()
    }),
    new transports.File({
      filename: 'logs/app.log',
      level: 'info',
    }),
  ],
});

// Hook pour base de données
logger.on('data', async (log) => {
  try {
    await logToDatabase({
      id: uuidv4(),
      user_id: log.user_id || null,
      action: log.message,
      metadata: log.metadata || {},
    });
  } catch (err) {
    console.error('Erreur en enregistrant un log en base:', err.message);
  }
});

/**
 * Log custom pour injecter user_id et metadata
 */
logger.logDb = (level, message, options = {}) => {
  const { user_id, metadata } = options;

  // Winston log
  logger.log({
    level,
    message,
    user_id,
    metadata,
  });

  // Direct appel à logToDatabase en parallèle
  logToDatabase({
    id: uuidv4(),
    user_id: user_id || null,
    action: message,
    metadata: metadata || {},
  });
};

module.exports = logger;
