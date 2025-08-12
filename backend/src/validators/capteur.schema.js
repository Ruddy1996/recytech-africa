// src/validators/capteur.schema.js
const Joi = require('joi');

const capteurSchema = Joi.object({
  borne_id: Joi.string().uuid().required(),
  niveau_remplissage: Joi.number().required(),
  humidite: Joi.number().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  recorded_at: Joi.date().optional()
});

module.exports = capteurSchema;
