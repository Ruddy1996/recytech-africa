const db = require('../config/db');
const Echange = require('../models/echanges.model');
const Recompense = require('../models/recompenses.model');
const Notification = require('../models/notifications.model');
const Badge = require('../models/badges.model');
const Points = require('../models/points.model');

// Créer un échange (user)
exports.creerEchange = async (req, res) => {
  const client = await db.connect();
  try {
    const { recompense_id } = req.body;
    const user_id = req.user.id;

    await client.query('BEGIN');

    const recompense = await Recompense.getRecompenseById(recompense_id);
    if (!recompense || !recompense.actif) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Récompense invalide ou inactive" });
    }

    if (recompense.stock <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Récompense en rupture de stock" });
    }

    const userRes = await client.query(`SELECT points FROM users WHERE id = $1`, [user_id]);
    if (userRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const userPoints = userRes.rows[0].points;

    if (userPoints < recompense.points_requis) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Points insuffisants" });
    }

    await client.query(`UPDATE users SET points = points - $1 WHERE id = $2`, [
      recompense.points_requis,
      user_id,
    ]);

    await Points.effectuerTransaction({
      user_id,
      type: 'deduction',
      montant: recompense.points_requis,
      description: `Échange de la récompense "${recompense.titre}"`,
      source: 'echange'
    });

    await client.query(`UPDATE recompenses SET stock = stock - 1 WHERE id = $1`, [recompense_id]);

    const insert = await client.query(
      `INSERT INTO echanges_recompenses (id, user_id, recompense_id, statut)
       VALUES (gen_random_uuid(), $1, $2, 'validé') RETURNING *`,
      [user_id, recompense_id]
    );

    // Vérifier si c’est le premier échange validé
    const countResult = await client.query(
      `SELECT COUNT(*) FROM echanges_recompenses WHERE user_id = $1 AND statut = 'validé'`,
      [user_id]
    );

    if (parseInt(countResult.rows[0].count) === 1) {
      const badgeResult = await client.query(
        `SELECT id FROM badges WHERE condition_type = 'echanges_count' AND condition_value = 1`
      );

      if (badgeResult.rows.length > 0) {
        await Badge.attribuerBadge(user_id, badgeResult.rows[0].id);
        await Notification.createNotification({
          user_id,
          titre: "🎉 Nouveau badge débloqué !",
          message: `Félicitations ! Vous avez obtenu le badge "Premier échange".`,
          type: "succès",
          lien_action: "/badges/me"
        });
      }
    }

    await Notification.createNotification({
      user_id,
      titre: "Échange validé",
      message: `Votre échange pour la récompense "${recompense.titre || 'Récompense'}" a été validé.`,
      type: "succès",
      lien_action: "/echanges/me"
    });

    await client.query('COMMIT');
    res.status(201).json(insert.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erreur échange récompense :', err);
    res.status(500).json({ message: "Erreur lors de l'échange" });
  } finally {
    client.release();
  }
};

// Récupérer tous les échanges (admin)
exports.getAllEchanges = async (req, res) => {
  try {
    const echanges = await Echange.getAllEchanges();
    res.json(echanges);
  } catch (err) {
    console.error('Erreur récupération échanges :', err);
    res.status(500).json({ message: "Erreur lors de la récupération" });
  }
};

// Récupérer un échange par ID
exports.getEchangeById = async (req, res) => {
  try {
    const { id } = req.params;
    const echange = await Echange.getEchangeById(id);
    if (!echange) return res.status(404).json({ message: 'Échange non trouvé' });
    res.json(echange);
  } catch (err) {
    console.error('Erreur getById :', err);
    res.status(500).json({ message: "Erreur lors de la récupération" });
  }
};

// Récupérer les échanges de l'utilisateur connecté
exports.getMesEchanges = async (req, res) => {
  try {
    const user_id = req.user.id;
    const echanges = await Echange.getEchangesByUser(user_id);
    res.json(echanges);
  } catch (err) {
    console.error('Erreur getMesEchanges :', err);
    res.status(500).json({ message: "Erreur lors de la récupération" });
  }
};

// Mise à jour du statut (admin)
exports.updateStatut = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, details } = req.body;

    const allowedStatus = ['en_attente', 'validé', 'refusé'];
    if (!allowedStatus.includes(statut)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const updated = await Echange.updateStatutEchange(id, statut, details);

    if (!updated) {
      return res.status(404).json({ message: 'Échange non trouvé' });
    }

    if (statut === 'validé' || statut === 'refusé') {
      await Notification.createNotification({
        user_id: updated.user_id,
        titre: `Échange ${statut}`,
        message: `Votre échange a été ${statut}.`,
        type: statut === 'validé' ? 'succès' : 'erreur',
        lien_action: "/echanges/me"
      });
    }

    res.json(updated);
  } catch (err) {
    console.error('Erreur update statut :', err);
    res.status(500).json({ message: "Erreur mise à jour du statut" });
  }
};

// Valider manuellement un échange (admin ou automatisé plus tard)
exports.validerEchange = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Echange.updateStatutEchange(id, 'validé', 'Validé manuellement');

    if (!updated) return res.status(404).json({ message: 'Échange non trouvé' });
    res.json({ message: 'Échange validé', echange: updated });
  } catch (err) {
    console.error('Erreur validation échange :', err);
    res.status(500).json({ message: "Erreur lors de la validation" });
  }
};

// Supprimer un échange (admin)
exports.supprimerEchange = async (req, res) => {
  try {
    const { id } = req.params;
    await Echange.deleteEchange(id);
    res.json({ message: 'Échange supprimé' });
  } catch (err) {
    console.error('Erreur suppression :', err);
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};
