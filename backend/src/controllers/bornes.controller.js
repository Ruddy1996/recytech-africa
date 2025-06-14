// src/controllers/bornes.controller.js

const borneModel = require('../models/bornes.model');
const { sendToClients } = require('../services/websocket');

const createBorne = async (req, res) => {
  try {
    const borne = await borneModel.createBorne(req.body);

    // Émission WebSocket si souhaité
    sendToClients('borne_created', borne);

    res.status(201).json(borne);
  } catch (error) {
    console.error('Erreur création borne:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la borne.' });
  }
};

const getAllBornes = async (req, res) => {
  try {
    const bornes = await borneModel.getAllBornes();
    res.status(200).json(bornes);
  } catch (error) {
    console.error('Erreur récupération bornes:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des bornes.' });
  }
};

const getBorneById = async (req, res) => {
  try {
    const id = req.params.id;
    const borne = await borneModel.getBorneById(id);

    if (!borne) {
      return res.status(404).json({ message: 'Borne non trouvée.' });
    }

    res.status(200).json(borne);
  } catch (error) {
    console.error('Erreur récupération borne par ID:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la borne.' });
  }
};

const updateBorne = async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await borneModel.updateBorne(id, req.body);

    // Émission WebSocket en temps réel si utile
    sendToClients('borne_updated', updated);

    res.status(200).json(updated);
  } catch (error) {
    console.error('Erreur mise à jour borne:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la borne.' });
  }
};

const deleteBorne = async (req, res) => {
  try {
    const id = req.params.id;
    await borneModel.deleteBorne(id);

    // Émission WebSocket en option
    sendToClients('borne_deleted', { id });

    res.status(204).send();
  } catch (error) {
    console.error('Erreur suppression borne:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la borne.' });
  }
};

const filterBornes = async (req, res) => {
  try {
    const filters = req.query;
    const bornes = await borneModel.filterBornes(filters);
    res.status(200).json(bornes);
  } catch (error) {
    console.error('Erreur filtrage bornes:', error);
    res.status(500).json({ message: 'Erreur lors du filtrage des bornes.' });
  }
};

module.exports = {
  createBorne,
  getAllBornes,
  getBorneById,
  updateBorne,
  deleteBorne,
  filterBornes,
};
