// src/validators/borne.schema.js
const Joi = require('joi');

const allowedStatuts = ['active', 'inactive', 'maintenance'];
const allowedTypes = ['publique', 'ecole', 'entreprise'];
const allowedModes = ['vente', 'location'];
const allowedDechets = ['plastique', 'metal'];

const borneSchema = Joi.object({
  code: Joi.string().max(50).required(),
  nom: Joi.string().max(100).optional(),
  type: Joi.string().valid(...allowedTypes).required(),
  statut: Joi.string().valid(...allowedStatuts).default('active'),
  mode_acquisition: Joi.string().valid(...allowedModes).required(),
  date_installation: Joi.date().optional(),

  // Coordonnées physiques (optionnelles, mises à jour par la borne réelle)
  latitude: Joi.number().optional().allow(null),
  longitude: Joi.number().optional().allow(null),
  niveau_remplissage: Joi.number().optional().allow(null),
  humidite: Joi.number().optional().allow(null),
  temperature: Joi.number().optional().allow(null),
  battery_level: Joi.number().optional().allow(null),
  last_data_received_at: Joi.date().optional().allow(null),

  // Poids et type de déchet pour calcul CO2
  poids_depose: Joi.number().optional().min(0).default(0),
  type_dechet: Joi.string().valid(...allowedDechets).optional().allow(null),
  co2_evite: Joi.number().optional().min(0).default(0),

  // Relations (IDs obligatoires)
  pays_id: Joi.string().uuid().required(),
  ville_id: Joi.string().uuid().required(),
  commune_id: Joi.string().uuid().required(),
  quartier_id: Joi.string().uuid().required(),
  client_id: Joi.string().uuid().optional().allow(null)
});

module.exports = borneSchema;
