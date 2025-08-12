const Notification = require('../models/notifications.model');

exports.getMesNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;
    const notifs = await Notification.getNotificationsByUser(user_id);
    res.json(notifs);
  } catch (err) {
    console.error("Erreur récupération notifications :", err);
    res.status(500).json({ message: "Erreur lors de la récupération" });
  }
};

exports.getAllNotifications = async (_req, res) => {
  try {
    const notifs = await Notification.getAll();
    res.json(notifs);
  } catch (err) {
    console.error('Erreur récupération notifications :', err);
    res.status(500).json({ message: 'Erreur lors de la récupération' });
  }
};

exports.marquerCommeLue = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.markAsRead(id);
    res.json({ message: "Notification marquée comme lue" });
  } catch (err) {
    console.error("Erreur update notif :", err);
    res.status(500).json({ message: "Erreur mise à jour" });
  }
};

exports.marquerToutesCommeLues = async (req, res) => {
  try {
    // Ici on marque toutes les notifs du user connecté
    // (si vous voulez un bouton « tout » global, passez plutôt null)
    await Notification.markAllAsRead(req.user.id);
    res.json({ message: "Toutes les notifications marquées comme lues" });
  } catch (err) {
    console.error("Erreur update all notifs :", err);
    res.status(500).json({ message: "Erreur mise à jour (all)" });
  }
};