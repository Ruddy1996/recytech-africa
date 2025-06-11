const User = require('../models/user.model');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    delete user.password;
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.updateProfile = async (req, res) => {
  const { full_name, password } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    let hashedPassword = user.password;
    if (password) hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await User.update({
      id: req.user.id,
      full_name: full_name || user.full_name,
      password: hashedPassword
    });

    delete updatedUser.password;
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.linkNFC = async (req, res) => {
  const { nfc_uid } = req.body;

  try {
    const user = await User.linkNFC(req.user.id, nfc_uid);
    res.json({ message: "Carte NFC liée avec succès", user });
  } catch (error) {
    res.status(500).json({ message: "Erreur de liaison NFC", error });
  }
};