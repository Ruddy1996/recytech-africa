const Clients = require('../models/clients.model');

const ClientsController = {
  async getAll(req, res) {
    const clients = await Clients.getAll();
    res.json(clients);
  },

  async getById(req, res) {
    const client = await Clients.getById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client non trouvé' });
    res.json(client);
  },

  async create(req, res) {
    const newClient = await Clients.create(req.body);
    res.status(201).json(newClient);
  },

  async update(req, res) {
    const updated = await Clients.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Client non trouvé' });
    res.json(updated);
  },

  async delete(req, res) {
    const deleted = await Clients.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Client non trouvé' });
    res.json({ message: 'Client supprimé avec succès' });
  }
};

module.exports = ClientsController;
