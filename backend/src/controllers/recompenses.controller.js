const { v4: uuidv4 } = require('uuid');
const Recompense = require('../models/recompenses.model');

const getAll = async (req, res) => {
  try {
    const data = await Recompense.getAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Recompense.getById(id);
    if (!data) return res.status(404).json({ message: 'Récompense introuvable' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const id = uuidv4();
    const newRecompense = await Recompense.create({ id, ...req.body });
    res.status(201).json(newRecompense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const updated = await Recompense.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await Recompense.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
