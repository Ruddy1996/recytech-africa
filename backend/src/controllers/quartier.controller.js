const Quartier = require('../models/quartier.model');

exports.getQuartiers = async (req, res) => {
  try {
    const data = await Quartier.getAllQuartiers();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getQuartier = async (req, res) => {
  try {
    const data = await Quartier.getQuartierById(req.params.id);
    if (!data) return res.status(404).json({ message: "Quartier non trouvé" });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getQuartiersByCommune = async (req, res) => {
  try {
    const { commune_id } = req.query;
    if (!commune_id) return res.status(400).json({ message: "commune_id manquant" });

    const data = await Quartier.getQuartiersByCommune(commune_id);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.createQuartier = async (req, res) => {
  try {
    const data = await Quartier.createQuartier(req.body);
    res.status(201).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateQuartier = async (req, res) => {
  try {
    const data = await Quartier.updateQuartier(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteQuartier = async (req, res) => {
  try {
    await Quartier.deleteQuartier(req.params.id);
    res.json({ message: "Quartier supprimé" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
