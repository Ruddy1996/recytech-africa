const Tirage        = require('../models/tirages.model');
const Notification  = require('../models/notifications.model');
const UserModel     = require('../models/user.model');     // pour récupérer le solde

/* ============= ADMIN ============= */

/** POST /api/tirages */
exports.create = async (req, res) => {
  try {
    const tirage = await Tirage.create(req.body);
    res.status(201).json(tirage);
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: e.message });
  }
};

/** GET /api/tirages */
exports.list = async (req, res) => {
  const page   = parseInt(req.query.page || '1', 10);
  const limit  = parseInt(req.query.limit || '10', 10);
  const q      = (req.query.q || '').trim();
  const actif  = req.query.actif || 'all';

  try {
    const { rows, total } = await Tirage.list({ page, limit, q, actif });
    res.set('X-Total-Pages', Math.max(1, Math.ceil(total / limit)));
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

/** PATCH /api/tirages/:id/actif */
exports.toggleActif = async (req, res) => {
  try {
    const updated = await Tirage.toggle(req.params.id, req.body.actif);
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

/** POST /api/tirages/:id/draw */
exports.draw = async (req, res) => {
  try {
    const gagnant_id = await Tirage.drawWinner(req.params.id);

    // notifier
    await Notification.createNotification({
      user_id: gagnant_id,
      titre  : "🎉 Tirage gagné",
      message: "Félicitations, vous avez remporté le tirage !",
      type   : "success",
      lien_action: "/tirages/me"
    });

    res.json({ gagnant_id });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

/* ============= UTILISATEUR ============= */

/** POST /api/tirages/:id/participer */
exports.participate = async (req, res) => {
  try {
    const tirage = (await Tirage.list({ page:1, limit:1, q:'', actif:'true' }))
                     .rows.find(t => t.id === req.params.id);
    if (!tirage) return res.status(404).json({ message: 'Tirage introuvable' });

    const user = await UserModel.findById(req.user.id);

    if (await Tirage.hasParticipated(tirage.id, user.id)) {
      return res.status(400).json({ message: 'Déjà inscrit' });
    }

    await Tirage.participate(tirage, user);
    res.status(201).json({ message: 'Participation enregistrée' });

  } catch (e) {
    console.error(e);
    res.status(400).json({ message: e.message });
  }
};
