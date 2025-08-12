/* src/controllers/contrats.controller.js */
const Contrat = require('../models/contrats.model');
const log     = require('../utils/logUserAction');    // pour tracer côté admin

const sanitizePagination = (req) => ({
  page   : parseInt(req.query.page,   10) || 1,
  limit  : parseInt(req.query.limit,  10) || 10,
  status : req.query.status || 'all',
  client_id: req.query.client_id,
  borne_id : req.query.borne_id,
  q      : (req.query.q || '').trim(),
});

/* ─────────── Liste paginée ─────────── */
exports.list = async (req, res) => {
  const filters = sanitizePagination(req);
  const { rows, total } = await Contrat.list(filters);

  res.set('X-Total-Pages', Math.max(1, Math.ceil(total / filters.limit)));
  res.json(rows);
};

/* ─────────── CRUD de base ─────────── */
exports.get    = async (req, res) => res.json(await Contrat.getById(req.params.id));

exports.create = async (req, res) => {
  try {
    const c = await Contrat.create(req.body);
    await log(req.user.id, 'ADMIN_CREATE_CONTRAT', { contrat: c.id });
    res.status(201).json(c);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const c = await Contrat.update(req.params.id, req.body);
    if (!c) return res.status(404).json({ message: 'Contrat introuvable' });
    await log(req.user.id, 'ADMIN_UPDATE_CONTRAT', { contrat: c.id });
    res.json(c);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const c = await Contrat.toggleStatus(req.params.id, req.body.statut);
    res.json(c);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.remove = async (req, res) => {
  await Contrat.remove(req.params.id);
  await log(req.user.id, 'ADMIN_DELETE_CONTRAT', { contrat: req.params.id });
  res.status(204).send();
};
