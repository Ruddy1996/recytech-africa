const Depots = require('../models/depots.model');
const io = require('../sockets/io'); // WebSocket

const DepotsController = {
  async enregistrerDepot(req, res) {
    try {
      const { user_id, borne_id, poids, type_dechet } = req.body;

      // 🎯 Calcul des points
      const points = Math.round(poids * 10); // Ex. 10 pts par kg

      const depot = await Depots.enregistrerDepot({
        user_id,
        borne_id,
        poids,
        type_dechet,
        points
      });

      // 📡 Broadcast WebSocket temps réel
      io.emit('nouveau_depot', depot);

      res.status(201).json(depot);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur enregistrement dépôt' });
    }
  },

  async getByUser(req, res) {
  const depots = await Depots.getByUser(req.params.id);
  res.json(depots);
},

async getStatsByUser(req, res) {
  const stats = await Depots.getStatsByUser(req.params.id);
  res.json(stats);
},

};

module.exports = DepotsController;
