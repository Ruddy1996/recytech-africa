// src/controllers/alertes.controller.js
const alerteModel = require('../models/alertes.model');
const { sendToClients } = require('../sockets/io');

const createAlerte = async (req, res) => {
  try {
    const alerte = await alerteModel.createAlerte(req.body);
    sendToClients('new_alerte', alerte);
    res.status(201).json(alerte);
  } catch (error) {
    console.error('Erreur création alerte:', error);
    res.status(500).json({ message: "Erreur lors de la création de l'alerte." });
  }
};

const getAlertes = async (req, res) => {
  try {
    const statut = req.query.statut || null;
    const alertes = await alerteModel.getAlertes(statut);
    res.status(200).json(alertes);
  } catch (error) {
    console.error('Erreur récupération alertes:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des alertes.' });
  }
};


const resolveAlerte = async (req, res) => {
  try {
    const id = req.params.id;
    const resolved = await alerteModel.resolveAlerte(id);
    sendToClients('alerte_resolue', resolved);
    res.status(200).json(resolved);
  } catch (error) {
    console.error('Erreur résolution alerte:', error);
    res.status(500).json({ message: "Erreur lors de la résolution de l'alerte." });
  }
};

module.exports = {
  createAlerte,
  getAlertes,
  resolveAlerte,
};
