const PlansModel = require('../models/plans.model');

exports.create = async (req, res) => {
  try {
    const plan = await PlansModel.createPlan(req.body);
    res.status(201).json(plan);
  } catch (err) {
    console.error("Erreur création plan :", err);
    res.status(500).json({ message: "Erreur lors de la création du plan." });
  }
};

exports.getAll = async (req, res) => {
  try {
    const plans = await PlansModel.getAllPlans();
    res.json(plans);
  } catch (err) {
    console.error("Erreur récupération plans :", err);
    res.status(500).json({ message: "Erreur lors de la récupération des plans." });
  }
};

exports.getById = async (req, res) => {
  try {
    const plan = await PlansModel.getPlanById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan non trouvé." });
    res.json(plan);
  } catch (err) {
    console.error("Erreur récupération plan par ID :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
