// src/controllers/alertes.controller.js
const alerteModel = require('../models/alertes.model');
const { sendToClients } = require('../sockets/io');

const createAlerte = async (req, res) => {
  try {
    let alerte = await alerteModel.createAlerte(req.body);

    // Assurer les champs nécessaires pour le frontend
    alerte = {
      id: alerte.id,
      type_alerte: alerte.type_alerte,
      message: alerte.message,
      niveau: alerte.niveau,
      est_resolue: alerte.est_resolue ?? false,
      created_at: alerte.created_at ?? new Date().toISOString(),
      ...alerte,
    };

    // Émettre la nouvelle alerte à tous les clients connectés
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

    // Assurer les champs nécessaires pour le frontend
    const alerte = {
      id: resolved.id,
      type_alerte: resolved.type_alerte,
      message: resolved.message,
      niveau: resolved.niveau,
      est_resolue: resolved.est_resolue ?? true,
      created_at: resolved.created_at ?? new Date().toISOString(),
      ...resolved,
    };

    // Émettre la résolution de l'alerte
    sendToClients('alerte_resolue', alerte);

    res.status(200).json(alerte);
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
