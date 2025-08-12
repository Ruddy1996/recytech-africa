// src/controllers/bornes.controller.js
const borneModel = require('../models/borne.model');

const getAllBornes = async (req, res) => {
  try {
    const bornes = await borneModel.getAllBornes();
    res.json(bornes);
  } catch (error) {
    console.error('Erreur lors de la récupération des bornes :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getBorneById = async (req, res) => {
  try {
    const borne = await borneModel.getBorneById(req.params.id);
    if (!borne) {
      return res.status(404).json({ message: 'Borne non trouvée' });
    }
    res.json(borne);
  } catch (error) {
    console.error('Erreur lors de la récupération de la borne :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const createBorne = async (req, res) => {
  try {
    const { code, nom, type, statut, mode_acquisition, date_installation,
            latitude, longitude, niveau_remplissage, humidite, last_data_received_at,
            client_id, quartier_id } = req.body;

    if (!code || !nom || !type || !client_id || !quartier_id) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    const newBorne = await borneModel.createBorne({
      code, nom, type, statut, mode_acquisition, date_installation,
      latitude, longitude, niveau_remplissage, humidite, last_data_received_at,
      client_id, quartier_id
    });

    res.status(201).json(newBorne);
  } catch (error) {
    console.error('Erreur lors de la création de la borne :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const updateBorne = async (req, res) => {
  try {
    const borne = await borneModel.getBorneById(req.params.id);
    if (!borne) {
      return res.status(404).json({ message: 'Borne non trouvée' });
    }

    const updatedBorne = await borneModel.updateBorne(req.params.id, req.body);
    res.json(updatedBorne);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la borne :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const deleteBorne = async (req, res) => {
  try {
    const borne = await borneModel.getBorneById(req.params.id);
    if (!borne) {
      return res.status(404).json({ message: 'Borne non trouvée' });
    }

    await borneModel.deleteBorne(req.params.id);
    res.json({ message: 'Borne supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la borne :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const filterBornes = async (req, res) => {
  try {
    const {
      type,
      statut,
      client_id,
      quartier_id,
      ville_id,
      commune_id,
      pays_id
    } = req.query;

    // Création de l'objet filtre (seuls les champs définis sont pris en compte)
    const filters = {};
    if (type) filters.type = type;
    if (statut) filters.statut = statut;
    if (client_id) filters.client_id = client_id;
    if (quartier_id) filters.quartier_id = quartier_id;
    if (ville_id) filters.ville_id = ville_id;
    if (commune_id) filters.commune_id = commune_id;
    if (pays_id) filters.pays_id = pays_id;

    const bornes = await borneModel.filterBornes(filters);
    res.status(200).json(bornes);
  } catch (error) {
    console.error('Erreur lors du filtrage des bornes :', error);
    res.status(500).json({ error: 'Erreur lors du filtrage des bornes' });
  }
};


module.exports = {
  getAllBornes,
  getBorneById,
  createBorne,
  updateBorne,
  deleteBorne,
  filterBornes
};
