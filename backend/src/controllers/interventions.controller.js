const InterventionModel = require('../models/interventions.model');

// ➕ Créer une intervention
const createInterventionBorne = async (req, res) => {
  try {
    const data = await InterventionModel.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    console.error('Erreur lors de la création de l\'intervention :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// 📄 Récupérer toutes les interventions
const getAllInterventionsBorne = async (req, res) => {
  try {
    const data = await InterventionModel.findAll();
    res.status(200).json(data);
  } catch (err) {
    console.error('Erreur lors de la récupération des interventions :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// 🔍 Récupérer une intervention par ID
const getInterventionBorneById = async (req, res) => {
  try {
    const data = await InterventionModel.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ error: 'Intervention non trouvée' });
    }
    res.status(200).json(data);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'intervention :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// ✏️ Mettre à jour une intervention
const updateInterventionBorne = async (req, res) => {
  try {
    const data = await InterventionModel.update(req.params.id, req.body);
    res.status(200).json(data);
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'intervention :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// 🗑️ Supprimer une intervention
const deleteInterventionBorne = async (req, res) => {
  try {
    await InterventionModel.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'intervention :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const  getInterventionsByBorneId= async (req, res)=> {
  try {
    const { borneId } = req.params;
    const result = await pool.query(
      'SELECT * FROM interventions_borne WHERE borne_id = $1 ORDER BY date_intervention DESC',
      [borneId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erreur récupération interventions par borne :', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

const getFilteredInterventions =  async(req, res)=> {
  const { statut, intervenant } = req.query;
  const conditions = [];
  const values = [];

  if (statut) {
    values.push(statut);
    conditions.push(`statut = $${values.length}`);
  }

  if (intervenant) {
    values.push(intervenant);
    conditions.push(`intervenant ILIKE $${values.length}`);
  }

  const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  try {
    const result = await pool.query(
      `SELECT * FROM interventions_borne ${whereClause} ORDER BY date_intervention DESC`,
      values
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erreur de filtre intervention:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};



module.exports = {
  createInterventionBorne,
  getAllInterventionsBorne,
  getInterventionBorneById,
  updateInterventionBorne,
  deleteInterventionBorne,
  getInterventionsByBorneId,
  getFilteredInterventions
};
