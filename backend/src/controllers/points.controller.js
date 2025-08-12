const PointsModel = require('../models/points.model');

// ➕ Gagner ou retirer des points (admin ou système automatisé)
exports.transaction = async (req, res) => {
  try {
    const { user_id, montant, type, description, source } = req.body;

    const result = await PointsModel.effectuerTransaction({
      user_id,
      montant,
      type,
      description,
      source
    });

    res.status(200).json({
      message: "Transaction enregistrée avec succès",
      id: result.id
    });
  } catch (err) {
    console.error("Erreur transaction points:", err);
    res.status(400).json({ message: err.message || "Erreur de transaction" });
  }
};

// 📄 Historique de l'utilisateur connecté
exports.getMonHistorique = async (req, res) => {
  try {
    const user_id = req.user.id;
    const rows = await PointsModel.getHistoriqueByUser(user_id);
    res.json(rows);
  } catch (err) {
    console.error("Erreur getMonHistorique:", err);
    res.status(500).json({ message: "Erreur récupération historique" });
  }
};

// 📄 Historique complet (admin)
exports.getAll = async (req, res) => {
  try {
    const rows = await PointsModel.getAllMouvements();
    res.json(rows);
  } catch (err) {
    console.error("Erreur historique admin:", err);
    res.status(500).json({ message: "Erreur récupération globale" });
  }
};
