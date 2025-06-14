const ContratModel = require('../models/contrats.model');

exports.getAll = async (req, res) => {
  const contrats = await ContratModel.getAll();
  res.json(contrats);
};

exports.getById = async (req, res) => {
  const contrat = await ContratModel.getById(req.params.id);
  if (!contrat) return res.status(404).json({ message: 'Contrat non trouvé' });
  res.json(contrat);
};

exports.create = async (req, res) => {
  try {
    const contrat = await ContratModel.create(req.body);
    res.status(201).json(contrat);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Erreur lors de la création', error });
  }
};

exports.update = async (req, res) => {
  try {
    const contrat = await ContratModel.update(req.params.id, req.body);
    if (!contrat) return res.status(404).json({ message: 'Contrat non trouvé' });
    res.json(contrat);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour', error });
  }
};

exports.delete = async (req, res) => {
  await ContratModel.delete(req.params.id);
  res.json({ message: 'Contrat supprimé' });
};
