const VillesModel = require('../models/villes.model');

const getAll = async (req, res) => {
    try {
        const data = await VillesModel.getAllVilles();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getById = async (req, res) => {
    try {
        const data = await VillesModel.getVillesById(req.params.id);
        if (!data) return res.status(404).json({ message: 'Ville non trouvée' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getByPays = async (req, res) => {
    try {
        const data = await VillesModel.getVillesByPays(req.params.paysId);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const data = await VillesModel.createVille(req.body);
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const data = await VillesModel.updateVille(req.params.id, req.body);
        if (!data) return res.status(404).json({ message: 'Ville non trouvée' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        await VillesModel.deleteVille(req.params.id);
        res.json({ message: 'Ville supprimée avec succès' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAll,
    getById,
    getByPays,
    create,
    update,
    remove
};
