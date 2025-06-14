const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const User = require('../models/user.model'); // Adapter si nécessaire


exports.getDashboard = (req, res) => {
  res.json({ message: "Bienvenue sur le dashboard Admin", user: req.user });
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
};

exports.toggleUserActivation = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    user.is_active = !user.is_active;
    await user.save();

    res.json({ message: `Utilisateur ${user.is_active ? 'activé' : 'désactivé'}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors du changement de statut' });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { id } = req.user; // req.user injecté par le middleware d'authentification
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(401).json({ message: 'Ancien mot de passe incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Mot de passe mis à jour' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du mot de passe' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'Email non trouvé' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "Champs obligatoires manquants (nom, email, mot de passe)" });
    }

    // Vérifie si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Un utilisateur avec cet email existe déjà." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      id: uuidv4(),
      full_name,
      email,
      password: hashedPassword,
      qr_code_id: uuidv4(), // Tu peux remplacer par une vraie génération QR si nécessaire
      nfc_card_id: null,
      points: 0,
      qr_code_image: null,
      nfc_uid: null,
      role: role || 'user'
    });

    await newUser.save();


    res.status(201).json({ message: "Utilisateur créé avec succès", utilisateur: newUser });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};