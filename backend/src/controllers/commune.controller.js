const communeModel = require('../models/commune.model');

const getCommunes = async (req, res) => {
    try {
        const { ville_id } = req.query;
        let data;
        if (ville_id) {
            data = await communeModel.getCommunesByVille(ville_id);
        } else {
            data = await communeModel.getAllCommunes();
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCommune = async (req, res) => {
    try {
        const data = await communeModel.getCommuneById(req.params.id);
        if (!data) return res.status(404).json({ error: 'Commune non trouvée' });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createCommune = async (req, res) => {
    try {
        const data = await communeModel.createCommune(req.body);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateCommune = async (req, res) => {
    try {
        const data = await communeModel.updateCommune(req.params.id, req.body);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteCommune = async (req, res) => {
    try {
        const data = await communeModel.deleteCommune(req.params.id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getCommunes,
    getCommune,
    createCommune,
    updateCommune,
    deleteCommune
};
