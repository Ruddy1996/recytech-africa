const Badge = require('../models/badges.model');

exports.getMesBadges = async (req, res) => {
  try {
    const user_id = req.user.id;
    const badges = await Badge.getBadgesUtilisateur(user_id);
    res.json(badges);
  } catch (err) {
    console.error("Erreur get badges :", err);
    res.status(500).json({ message: "Erreur récupération badges" });
  }
};

exports.getAllBadges = async (req, res) => {
  try {
    const list = await Badge.getAllBadges();
    res.json(list);
  } catch (err) {
    console.error("Erreur get all badges :", err);
    res.status(500).json({ message: "Erreur récupération badges" });
  }
};

// Créer un badge (admin)
exports.creerBadge = async (req, res) => {
  try {
    const { nom, description, image_url, condition_type, condition_value } = req.body;
    const badge = await Badge.createBadge({ nom, description, image_url, condition_type, condition_value });
    res.status(201).json(badge);
  } catch (err) {
    console.error('Erreur création badge :', err);
    res.status(500).json({ message: "Erreur lors de la création" });
  }
};

// Mettre à jour un badge (admin)
exports.updateBadge = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Badge.updateBadge(id, req.body);
    res.json(updated);
  } catch (err) {
    console.error('Erreur mise à jour badge :', err);
    res.status(500).json({ message: "Erreur mise à jour" });
  }
};

// Supprimer un badge (admin)
exports.supprimerBadge = async (req, res) => {
  try {
    const { id } = req.params;
    await Badge.deleteBadge(id);
    res.json({ message: "Badge supprimé" });
  } catch (err) {
    console.error('Erreur suppression badge :', err);
    res.status(500).json({ message: "Erreur suppression" });
  }
};
