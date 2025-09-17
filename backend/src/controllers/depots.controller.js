// src/controllers/depots.controller.js
const Depots = require('../models/depots.model');
const borneModel = require('../models/borne.model');
const { calculCO2Evite } = require('../sockets/co2');
const { sendToClients, sendToUser } = require('../sockets/io'); 
const { emitBorneStats } = require('./bornes.controller');

const DepotsController = {
  async enregistrerDepot(req, res) {
    try {
      const { user_id, borne_id, poids, type_dechet } = req.body;

      if (!user_id || !borne_id || !poids || !type_dechet) {
        return res.status(400).json({ message: "Champs obligatoires manquants" });
      }

      // 🎯 Points gagnés (10 pts/kg par ex.)
      const points = Math.round(poids * 10);

      // 1️⃣ Enregistrer le dépôt
      const depot = await Depots.enregistrerDepot({
        user_id,
        borne_id,
        poids,
        type_dechet,
        points
      });

      // 2️⃣ Vérifier la borne
      const borne = await borneModel.getBorneById(borne_id);
      if (!borne) {
        return res.status(404).json({ message: "Borne non trouvée" });
      }

      // 3️⃣ Calcul CO₂ évité
      const co2_evite = calculCO2Evite(type_dechet, poids);

      // 4️⃣ Mise à jour de la borne
      const updatedBorne = await borneModel.updateBorne(borne_id, {
        poids_depose: (borne.poids_depose || 0) + poids,
        type_dechet,
        co2_evite: (borne.co2_evite || 0) + co2_evite,
        last_data_received_at: new Date()
      });

      // 5️⃣ Diffusion temps réel
      sendToClients("DEPOT_CREATED", depot);
      sendToClients("BORNE_UPDATED", updatedBorne);

      // 6️⃣ Stats globales
      await emitBorneStats();

      // 7️⃣ Stats utilisateur
      const userStats = await Depots.getStatsByUser(user_id);

      // 🔥 Envoi direct aux devices de l’utilisateur
      sendToUser(user_id, "USER_STATS_UPDATED", {
        points_gagnes: points,
        poids,
        type_dechet,
        total: userStats
      });

      // ✅ Réponse finale
      res.status(201).json({
        message: "✅ Dépôt enregistré avec succès",
        depot,
        borne: updatedBorne,
        userStats
      });

    } catch (err) {
      console.error("Erreur enregistrement dépôt :", err);
      res.status(500).json({ message: "Erreur enregistrement dépôt" });
    }
  },

  // 🔹 Récupérer les dépôts d’un utilisateur
  async getByUser(req, res) {
    try {
      const depots = await Depots.getByUser(req.params.id);
      res.json(depots);
    } catch (err) {
      console.error("Erreur récupération dépôts :", err);
      res.status(500).json({ message: "Erreur récupération dépôts" });
    }
  },

  // 🔹 Récupérer les stats d’un utilisateur
  async getStatsByUser(req, res) {
    try {
      const stats = await Depots.getStatsByUser(req.params.id);
      res.json(stats);
    } catch (err) {
      console.error("Erreur récupération stats :", err);
      res.status(500).json({ message: "Erreur récupération stats" });
    }
  }
};

module.exports = DepotsController;
