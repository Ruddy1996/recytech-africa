const capteursModel = require('../models/capteurs.model');
const { sendToClients } = require('../services/websocket');
const capteurSchema = require('../validators/capteur.schema');

const insertCapteur = async (req, res) => {
  const { error, value } = capteurSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Données capteur invalides', details: error.details });
  }

  try {
    const capteur = await capteursModel.insertCapteurData(value);

    // 🔴 Diffuser aux clients WebSocket
    sendToClients('capteur_data', capteur);

    res.status(201).json(capteur);
  } catch (err) {
    console.error('Erreur insertion capteur:', err);
    res.status(500).json({ message: 'Erreur lors de l’insertion des données capteur.' });
  }
};

module.exports = {
  insertCapteur,
};
