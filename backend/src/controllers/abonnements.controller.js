const Abonnement = require('../models/abonnements.model');
const Plan = require('../models/plans.model');

// Créer un abonnement (admin ou autorité)
exports.creerAbonnement = async (req, res) => {
  try {
    const data = req.body;
    data.user_admin_id = req.user.id;
    const abonnement = await Abonnement.createAbonnement(data);
    res.status(201).json(abonnement);
  } catch (err) {
    console.error('Erreur création abonnement :', err);
    res.status(500).json({ message: "Erreur lors de la création de l'abonnement" });
  }
};

// Tous les abonnements (admin)
exports.getAllAbonnements = async (req, res) => {
  try {
    const abonnements = await Abonnement.getAllAbonnements();
    res.json(abonnements);
  } catch (err) {
    console.error('Erreur récupération abonnements :', err);
    res.status(500).json({ message: "Erreur lors de la récupération" });
  }
};

// Voir mes abonnements
exports.getMesAbonnements = async (req, res) => {
  try {
    const user_id = req.user.id;
    const abonnements = await Abonnement.getAbonnementByUserId(user_id);
    res.json(abonnements);
  } catch (err) {
    console.error('Erreur récupération mes abonnements :', err);
    res.status(500).json({ message: "Erreur lors de la récupération" });
  }
};

// Tous les plans
exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.getAllPlans();
    res.json(plans);
  } catch (err) {
    console.error('Erreur récupération plans :', err);
    res.status(500).json({ message: "Erreur lors de la récupération des plans" });
  }
};
