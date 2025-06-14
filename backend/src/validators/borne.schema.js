// src/validators/borne.schema.js
const Joi = require('joi');

const allowedStatuts = ['active', 'inactive', 'maintenance'];
const allowedTypes = ['publique', 'ecole', 'entreprise'];
const allowedModes = ['vente', 'location'];

const borneSchema = Joi.object({
  code: Joi.string().max(50).required(),
  nom: Joi.string().max(100).optional(),
  type: Joi.string().valid(...allowedTypes).optional(),
  statut: Joi.string().valid(...allowedStatuts).default('active'),
  mode_acquisition: Joi.string().valid(...allowedModes).optional(),
  date_installation: Joi.date().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  niveau_remplissage: Joi.number().optional(),
  humidite: Joi.number().optional(),
  last_data_received_at: Joi.date().optional(),
  client_id: Joi.string().uuid().optional()
});

module.exports = borneSchema;
