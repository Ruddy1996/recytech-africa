const StatsModel = require('../models/stats.model');

const StatsController = {
  async globalStats(req, res) {
    try {
      const stats = await StatsModel.getGlobalStats();
      res.json(stats);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur stats globales' });
    }
  },

  async userStats(req, res) {
    try {
      const stats = await StatsModel.getStatsByUser(req.params.id);
      res.json(stats);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur stats utilisateur' });
    }
  },

  async statsParBorne(req, res) {
    try {
      const stats = await StatsModel.getStatsParBorne();
      res.json(stats);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur stats par borne' });
    }
  },

  async depotsParJour(req, res) {
    try {
      const stats = await StatsModel.getDepotsParJour();
      res.json(stats);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur stats par jour' });
    }
  },

  async depotDetails(req, res) {
    try {
      const depot = await StatsModel.getDepotDetailsById(req.params.id);
      if (!depot) return res.status(404).json({ message: "Dépôt introuvable" });
      res.json(depot);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur lors de la récupération du dépôt" });
    }
  }
};

module.exports = StatsController;
