// src/models/capteurs.model.js
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { sendToClients } = require('../sockets/io');

const insertCapteur = async (data) => {
  const id = uuidv4();
  const {
    borne_id,
    niveau_remplissage,
    humidite,
    latitude,
    longitude,
    recorded_at = new Date()
  } = data;

  const insertQuery = `
    INSERT INTO borne_capteurs_logs (
      id, borne_id, niveau_remplissage, humidite,
      latitude, longitude, recorded_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const statusUpsertQuery = `
    INSERT INTO bornes_status (
      borne_id, niveau_remplissage, humidite,
      latitude, longitude, last_update
    ) VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (borne_id)
    DO UPDATE SET
      niveau_remplissage = EXCLUDED.niveau_remplissage,
      humidite = EXCLUDED.humidite,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      last_update = EXCLUDED.last_update;
  `;

  await db.query(insertQuery, [
    id, borne_id, niveau_remplissage, humidite,
    latitude, longitude, recorded_at
  ]);

  await db.query(statusUpsertQuery, [
    borne_id, niveau_remplissage, humidite,
    latitude, longitude, recorded_at
  ]);

  // 🔄 Relecture de la vue pour cette borne
  const vBorne = await db.query(`SELECT * FROM v_bornes_status WHERE borne_id = $1`, [borne_id]);

  // 🔔 Envoi aux clients WebSocket
  sendToClients('borne_status_updated', vBorne.rows[0]);
  
  return { id, borne_id, niveau_remplissage, humidite, latitude, longitude, recorded_at };
};

module.exports = {
  insertCapteur
};
