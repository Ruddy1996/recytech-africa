const PaysModel = require('../models/pays.model');

const getAll = async (req, res) => {
    try {
        const data = await PaysModel.getAllPays();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getById = async (req, res) => {
    try {
        const data = await PaysModel.getPaysById(req.params.id);
        if (!data) return res.status(404).json({ message: 'Pays non trouvé' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const data = await PaysModel.createPays(req.body);
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const data = await PaysModel.updatePays(req.params.id, req.body);
        if (!data) return res.status(404).json({ message: 'Pays non trouvé' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        await PaysModel.deletePays(req.params.id);
        res.json({ message: 'Pays supprimé avec succès' });
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
