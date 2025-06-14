// src/routes/bornes.routes.js

const express = require('express');
const router = express.Router();
const bornesController = require('../controllers/bornes.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const authorizeRoles = require('../middlewares/authorize.middleware');
const validate = require('../middlewares/validate.middleware');
const borneSchema = require('../validators/borne.schema');

/**
 * @swagger
 * tags:
 *   name: Bornes
 *   description: Gestion des bornes connectées
 */

// ➕ Créer une borne
/**
 * @swagger
 * /bornes:
 *   post:
 *     summary: Créer une borne
 *     tags: [Bornes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Borne'
 *     responses:
 *       201:
 *         description: Borne créée
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  validate(borneSchema),
  bornesController.createBorne
);

// 📄 Récupérer toutes les bornes
/**
 * @swagger
 * /bornes:
 *   get:
 *     summary: Obtenir toutes les bornes
 *     tags: [Bornes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des bornes
 */
router.get('/', authenticateToken, authorizeRoles('admin'), bornesController.getAllBornes);

// 🔍 Récupérer une borne par ID
/**
 * @swagger
 * /bornes/{id}:
 *   get:
 *     summary: Obtenir une borne par ID
 *     tags: [Bornes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la borne
 *     responses:
 *       200:
 *         description: Détails de la borne
 */
router.get('/:id', authenticateToken, authorizeRoles('admin'), bornesController.getBorneById);

// ✏️ Mettre à jour une borne
/**
 * @swagger
 * /bornes/{id}:
 *   put:
 *     summary: Mettre à jour une borne
 *     tags: [Bornes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Borne'
 *     responses:
 *       200:
 *         description: Borne mise à jour
 */
router.put('/:id', authenticateToken, authorizeRoles('admin'), validate(borneSchema), bornesController.updateBorne);

// 🗑️ Supprimer une borne
/**
 * @swagger
 * /bornes/{id}:
 *   delete:
 *     summary: Supprimer une borne
 *     tags: [Bornes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Borne supprimée
 */
router.delete('/:id', authenticateToken, authorizeRoles('admin'), bornesController.deleteBorne);
router.get('/filter', authenticateToken, authorizeRoles('admin'), borneController.filterBornes);


module.exports = router;
