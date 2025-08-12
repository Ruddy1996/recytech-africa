const db = require('../config/db');

// Vérifie si l'utilisateur connecté a accès à une fonctionnalité spécifique
const authorizePlanPermission = (permissionKey) => {
  return async (req, res, next) => {
    const userId = req.user.id;

    try {
      // On récupère l'abonnement actif de l'utilisateur
      const result = await db.query(
        `SELECT pt.*
         FROM abonnements_dashboards ad
         JOIN plans_tarifaires pt ON pt.nom = ad.plan_tarifaire
         WHERE ad.user_admin_id = $1 AND ad.statut = 'actif'
         LIMIT 1`,
        [userId]
      );

      const plan = result.rows[0];

      if (!plan) {
        return res.status(403).json({ message: "Aucun abonnement actif trouvé." });
      }

      if (!plan[permissionKey]) {
        return res.status(403).json({ message: "Accès non autorisé pour ce plan." });
      }

      // tout est bon
      next();

    } catch (err) {
      console.error('Erreur permission plan:', err);
      res.status(500).json({ message: "Erreur serveur lors de la vérification des permissions." });
    }
  };
};

module.exports = { authorizePlanPermission };
