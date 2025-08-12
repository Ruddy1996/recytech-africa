const pool = require('../config/db');

// Créer une notification
const createNotification = async ({ user_id, titre, message, type = 'info', lien_action = null }) => {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, titre, message, type, lien_action)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [user_id, titre, message, type, lien_action]
  );
  return result.rows[0];
};

const getAll = async () => {
  const { rows } = await pool.query(
    `SELECT n.*, u.email            -- on expose l’email pour l’admin
       FROM notifications n
       LEFT JOIN users u ON u.id = n.user_id
     ORDER BY n.created_at DESC`
  );
  return rows;
};

// Récupérer les notifications d’un utilisateur
const getNotificationsByUser = async (user_id) => {
  const result = await pool.query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
    [user_id]
  );
  return result.rows;
};

// Marquer une notification comme lue
const markAsRead = async (id) => {
  await pool.query(`UPDATE notifications SET lu = true WHERE id = $1`, [id]);
};

// 🔄 Tout marquer comme lu
const markAllAsRead = async (userId = null) => {
  if (userId) {
    // (cas classique : on ne touche qu’aux notifs du user connecté)
    await pool.query(`UPDATE notifications SET lu = true WHERE user_id = $1`, [
      userId,
    ]);
  } else {
    // (optionnel : pour un admin qui veut vraiment tout marquer)
    await pool.query(`UPDATE notifications SET lu = true WHERE lu = false`);
  }
};

module.exports = {
  createNotification,
  getNotificationsByUser,
  markAsRead,
  markAllAsRead,
  getAll, 
};
