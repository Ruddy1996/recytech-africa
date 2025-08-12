/* src/controllers/interventions.controller.js */
const Inter = require('../models/interventions.model');

/* ➕ Création ------------------------------------------------------- */
exports.create = async (req, res) => {
  try {
    const inter = await Inter.create(req.body);
    res.status(201).json(inter);
  } catch (e) {
    console.error('create intervention', e);
    res.status(400).json({ message: e.message });
  }
};

/* 📄 Liste paginée / filtrée --------------------------------------- */
exports.list = async (req, res) => {
  try {
    const page   = parseInt(req.query.page,  10) || 1;
    const limit  = parseInt(req.query.limit, 10) || 10;
    const { q, statut } = req.query;

    const { rows, total } = await Inter.findAll({ page, limit, q, statut });
    res.set('X-Total-Pages', Math.max(1, Math.ceil(total / limit)));
    res.json(rows);
  } catch (e) {
    console.error('list interventions', e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/* 🔍 Détail -------------------------------------------------------- */
exports.detail = async (req, res) => {
  const inter = await Inter.findById(req.params.id);
  if (!inter) return res.status(404).json({ message: 'Introuvable' });
  res.json(inter);
};

/* ✏️ Mise à jour --------------------------------------------------- */
exports.update = async (req, res) => {
  try {
    const inter = await Inter.update(req.params.id, req.body);
    res.json(inter);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

/* 🗑️ Suppression --------------------------------------------------- */
exports.remove = async (req, res) => {
  await Inter.remove(req.params.id);
  res.status(204).send();
};

/* 🔗 Liste pour une borne ----------------------------------------- */
exports.byBorne = async (req, res) => {
  res.json(await Inter.byBorne(req.params.borneId));
};
