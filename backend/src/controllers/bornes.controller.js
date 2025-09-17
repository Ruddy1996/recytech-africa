// src/controllers/bornes.controller.js
const borneModel = require('../models/borne.model');
const { sendToClients } = require('../sockets/io');
const { calculCO2Evite } = require('../sockets/co2'); // fonction pour calcul CO2
const depotModel = require('../models/depots.model');
const { v4: uuidv4 } = require('uuid');

// =============================
// 🚀 Émettre les stats des bornes
// =============================
const emitBorneStats = async () => {
  try {
    const bornes = await borneModel.getAllBornes();

    const online = bornes.filter(b => b.statut === "active").length;
    const offline = bornes.filter(b => b.statut !== "active").length;

    const tempsValues = bornes
      .map(b => b.temperature)
      .filter(v => v !== null && v !== undefined);

    const batteryValues = bornes
      .map(b => b.battery_level)
      .filter(v => v !== null && v !== undefined);

    const co2Values = bornes
      .map(b => b.co2_evite)
      .filter(v => v !== null && v !== undefined);

    const moy_temperature =
      tempsValues.length > 0
        ? tempsValues.reduce((a, b) => a + b, 0) / tempsValues.length
        : 0;

    const moy_battery =
      batteryValues.length > 0
        ? batteryValues.reduce((a, b) => a + b, 0) / batteryValues.length
        : 0;

    const total_co2_evite =
      co2Values.length > 0
        ? co2Values.reduce((a, b) => a + b, 0)
        : 0;

    const stats = {
      online,
      offline,
      moy_temperature: Number(moy_temperature.toFixed(2)),
      moy_battery: Number(moy_battery.toFixed(2)),
      total_co2_evite: Number(total_co2_evite.toFixed(2)),
      bornes,
    };

    sendToClients("borne_stats_update", stats);
  } catch (err) {
    console.error("Erreur émission stats bornes :", err);
  }
};

// =============================
// GET ALL BORNES
// =============================
const getAllBornes = async (req, res) => {
  try {
    const bornes = await borneModel.getAllBornes();
    res.json(bornes);
  } catch (error) {
    console.error('Erreur lors de la récupération des bornes :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// =============================
// GET BORNE BY ID
// =============================
const getBorneById = async (req, res) => {
  try {
    const borne = await borneModel.getBorneById(req.params.id);
    if (!borne) return res.status(404).json({ message: 'Borne non trouvée' });
    res.json(borne);
  } catch (error) {
    console.error('Erreur lors de la récupération de la borne :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// =============================
// CREATE BORNE
// =============================
const createBorne = async (req, res) => {
  try {
    const { code, nom, type, statut, mode_acquisition, date_installation,
            latitude, longitude, temperature, battery_level,
            niveau_remplissage, humidite, last_data_received_at,
            client_id, quartier_id } = req.body;

    if (!code || !nom || !type || !client_id || !quartier_id) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    const newBorne = await borneModel.createBorne({
      code, nom, type, statut, mode_acquisition, date_installation,
      latitude, longitude, temperature, battery_level,
      niveau_remplissage, humidite, last_data_received_at,
      client_id, quartier_id
    });

    sendToClients('BORNE_CREATED', newBorne);
    await emitBorneStats();

    res.status(201).json(newBorne);
  } catch (error) {
    console.error('Erreur lors de la création de la borne :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// =============================
// UPDATE BORNE
// =============================
const updateBorne = async (req, res) => {
  try {
    const borne = await borneModel.getBorneById(req.params.id);
    if (!borne) return res.status(404).json({ message: 'Borne non trouvée' });

    const updatedBorne = await borneModel.updateBorne(req.params.id, req.body);

    // Recalcul CO2 évité si poids et type de déchet fournis
    if (updatedBorne.poids_depose && updatedBorne.type_dechet) {
      updatedBorne.co2_evite = calculCO2Evite(
        updatedBorne.type_dechet,
        updatedBorne.poids_depose
      );
    } else {
      updatedBorne.co2_evite = 0;
    }

    sendToClients('BORNE_UPDATED', updatedBorne);
    await emitBorneStats();

    res.json(updatedBorne);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la borne :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// =============================
// DELETE BORNE
// =============================
const deleteBorne = async (req, res) => {
  try {
    const borne = await borneModel.getBorneById(req.params.id);
    if (!borne) return res.status(404).json({ message: 'Borne non trouvée' });

    await borneModel.deleteBorne(req.params.id);
    sendToClients('BORNE_DELETED', { id: req.params.id });
    await emitBorneStats();

    res.json({ message: 'Borne supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la borne :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// =============================
// FILTER BORNES
// =============================
const filterBornes = async (req, res) => {
  try {
    const { type, statut, client_id, quartier_id, page = 1, limit = 10 } = req.query;

    const filters = {};
    if (type) filters.type = type;
    if (statut) filters.statut = statut;
    if (client_id) filters.client_id = client_id;
    if (quartier_id) filters.quartier_id = quartier_id;

    const offset = (page - 1) * limit;
    const { rows, count } = await borneModel.filterBornes(filters, limit, offset);

    res.status(200).json({
      data: rows,
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error('Erreur lors du filtrage des bornes :', error);
    res.status(500).json({ error: 'Erreur lors du filtrage des bornes' });
  }
};

// =============================
// RECEIVE BORNE DATA (physique)
// =============================
const receiveBorneData = async (req, res) => {
  try {
    const { code } = req.params;
    const {
      user_id,              // 🔹 identifiant utilisateur qui scanne le QR code
      latitude,
      longitude,
      temperature,
      battery_level,
      niveau_remplissage,
      humidite,
      poids_depose,
      type_dechet,
      points_gagnes
    } = req.body;

    // 1️⃣ Mettre à jour la borne (état temps réel)
    const updatedBorne = await borneModel.updateBorneByCode(code, {
      latitude,
      longitude,
      temperature,
      battery_level,
      niveau_remplissage,
      humidite,
      poids_depose,
      type_dechet,
      last_data_received_at: new Date()
    });

    if (!updatedBorne) {
      return res.status(404).json({ message: 'Borne non trouvée' });
    }

    // 2️⃣ Calcul du CO₂ évité
    let co2_evite = 0;
    if (poids_depose && type_dechet) {
      co2_evite = calculCO2Evite(type_dechet, poids_depose);
    }

    // 3️⃣ Insérer un dépôt dans la table depot_dechets
    const depotId = uuidv4();
    await depotModel.createDepot({
      id: depotId,
      user_id,
      borne_id: updatedBorne.id,
      poids: poids_depose,
      type_dechet,
      points: points_gagnes || 0,
      created_at: new Date()
    });

    // 4️⃣ Mettre à jour la borne avec le CO₂ cumulé
    updatedBorne.co2_evite = (updatedBorne.co2_evite || 0) + co2_evite;

    // 5️⃣ Notifier les clients connectés
    sendToClients('BORNE_DATA_RECEIVED', {
      ...updatedBorne,
      lastDepot: {
        user_id,
        poids: poids_depose,
        type_dechet,
        points: points_gagnes || 0,
        co2_evite
      }
    });

    // 6️⃣ Mettre à jour les stats globales
    await emitBorneStats();

    res.json({
      message: '✅ Données reçues et enregistrées avec succès',
      borne: updatedBorne
    });
  } catch (error) {
    console.error('Erreur lors de la réception des données de la borne :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};


module.exports = {
  getAllBornes,
  getBorneById,
  createBorne,
  updateBorne,
  deleteBorne,
  filterBornes,
  receiveBorneData,
  emitBorneStats
};
