/* src/controllers/clients.controller.js */
const Clients = require('../models/clients.model');

/* Util : convertir string → int avec fallback */
const toInt = (v, d = 1) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) || n <= 0 ? d : n;
};

module.exports = {
  /* ------------------------------------------------------------------ */
  /* GET /api/clients ─ liste paginée + recherche                       */
  /* Query params : page, limit, q, type, telephone                     */
  /* ------------------------------------------------------------------ */
  async list(req, res) {
    try {
      const page   = toInt(req.query.page, 1);
      const limit  = toInt(req.query.limit, 10);

      const { rows, total } = await Clients.list({
        page,
        limit,
        q:         req.query.q || '',
        type:      req.query.type || 'all',
        telephone: req.query.telephone || ''
      });

      /* nb de pages dans l’en‑tête pour la pagination front */
      res.set('X-Total-Pages', Math.max(1, Math.ceil(total / limit)));
      res.json(rows);
    } catch (err) {
      console.error('❌ list clients', err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  /* ------------------------------------------------------------------ */
  /* GET /api/clients/:id                                               */
  /* ------------------------------------------------------------------ */
  async getById(req, res) {
    try {
      const client = await Clients.getById(req.params.id);
      if (!client) return res.status(404).json({ message: 'Client non trouvé' });
      res.json(client);
    } catch (err) {
      console.error('❌ get client', err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  },

  /* ------------------------------------------------------------------ */
  /* POST /api/clients                                                  */
  /* body : nom, email, telephone, type, localisation                   */
  /* ------------------------------------------------------------------ */
  async create(req, res) {
    try {
      const created = await Clients.create(req.body);
      res.status(201).json(created);
    } catch (err) {
      console.error('❌ create client', err);
      res.status(400).json({ message: err.message });
    }
  },

  /* ------------------------------------------------------------------ */
  /* PUT /api/clients/:id                                               */
  /* ------------------------------------------------------------------ */
  async update(req, res) {
    try {
      const updated = await Clients.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ message: 'Client non trouvé' });
      res.json(updated);
    } catch (err) {
      console.error('❌ update client', err);
      res.status(400).json({ message: err.message });
    }
  },

  /* ------------------------------------------------------------------ */
  /* DELETE /api/clients/:id                                            */
  /* ------------------------------------------------------------------ */
  async remove(req, res) {
    try {
      await Clients.remove(req.params.id);
      res.status(204).send(); // 204 No Content
    } catch (err) {
      console.error('❌ delete client', err);
      res.status(400).json({ message: err.message });
    }
  }
};
