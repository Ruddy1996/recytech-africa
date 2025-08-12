// src/controllers/bornesStatus.controller.js
const borneStatusModel = require('../models/bornes_status.model');
const db = require('../config/db');

const getAllBornesStatus = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT bs.*, b.code, b.nom
      FROM bornes_status bs
      JOIN bornes b ON b.id = bs.borne_id
      ORDER BY bs.last_update DESC;
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erreur getAllBornesStatus:', error);
    res.status(500).json({ message: 'Erreur récupération statut bornes.' });
  }
};

const getBornesStatus = async (req, res) => {
  try {
    const filters = {
      client_id: req.query.client_id,
      statut: req.query.statut,
      type: req.query.type,
    };

    const bornes = await borneStatusModel.getBornesStatus(filters);
    res.status(200).json(bornes);
  } catch (error) {
    console.error('Erreur récupération bornes status:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du statut des bornes.' });
  }
};

module.exports = { getAllBornesStatus, getBornesStatus,  };
