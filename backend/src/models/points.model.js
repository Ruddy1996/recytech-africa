const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * Enregistre un mouvement de points (gain ou déduction)
 * et met à jour automatiquement le solde de l’utilisateur.
 * 
 * @param {Object} params
 * @param {string} params.user_id - ID de l'utilisateur
 * @param {number} params.montant - Montant en points
 * @param {string} params.type - 'gain' ou 'deduction'
 * @param {string} [params.description] - Description du mouvement
 * @param {string} [params.source] - Source optionnelle (ex: 'tirage', 'echange', 'bonus')
 */
const effectuerTransaction = async ({ user_id, montant, type, description = '', source = null }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Vérifier si utilisateur existe
    const userCheck = await client.query(`SELECT points FROM users WHERE id = $1`, [user_id]);
    if (userCheck.rows.length === 0) {
      throw new Error("Utilisateur introuvable");
    }

    // Déduction : vérifier solde suffisant
    if (type === 'deduction') {
      const solde = userCheck.rows[0].points;
      if (solde < montant) throw new Error("Solde insuffisant pour cette opération");

      await client.query(`UPDATE users SET points = points - $1 WHERE id = $2`, [montant, user_id]);
    }
    // Gain
    else if (type === 'gain') {
      await client.query(`UPDATE users SET points = points + $1 WHERE id = $2`, [montant, user_id]);
    } else {
      throw new Error("Type de mouvement invalide. Utiliser 'gain' ou 'deduction'.");
    }

    // Enregistrement du mouvement
    const id = uuidv4();
    await client.query(`
      INSERT INTO points_mouvement (id, user_id, type, montant, description, source)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [id, user_id, type, montant, description, source]);

    await client.query('COMMIT');
    return { success: true, id };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Historique complet d’un utilisateur
const getHistoriqueByUser = async (user_id) => {
  const { rows } = await pool.query(
    `SELECT * FROM points_mouvement
     WHERE user_id = $1
     ORDER BY date_operation DESC`,
    [user_id]
  );
  return rows;
};

// Historique global (admin)
const getAllMouvements = async () => {
  const { rows } = await pool.query(`
    SELECT pm.*, u.nom, u.prenom
    FROM points_mouvement pm
    LEFT JOIN users u ON pm.user_id = u.id
    ORDER BY pm.date_operation DESC
  `);
  return rows;
};

module.exports = {
  effectuerTransaction,
  getHistoriqueByUser,
  getAllMouvements
};
