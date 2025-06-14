// src/validators/intervention.schema.js

const Joi = require('joi');

const interventionSchema = Joi.object({
  borne_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.empty': 'L’ID de la borne est requis',
      'string.uuid': 'L’ID de la borne doit être un UUID valide',
    }),

  type_intervention: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.empty': 'Le type d’intervention est requis',
    }),

  description: Joi.string()
    .allow('', null)
    .messages({
      'string.base': 'La description doit être une chaîne de caractères',
    }),

  date_intervention: Joi.date()
    .required()
    .messages({
      'date.base': 'La date d’intervention doit être une date valide',
      'any.required': 'La date d’intervention est requise',
    }),

  intervenant: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.empty': 'Le nom de l’intervenant est requis',
    }),

  statut: Joi.string()
    .valid('planifiee', 'terminee')
    .default('planifiee')
    .messages({
      'any.only': 'Le statut doit être soit "planifiee", soit "terminee"',
    }),
});

module.exports = interventionSchema;
