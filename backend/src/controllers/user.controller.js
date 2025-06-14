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

    await logUserAction(user.id, 'UPDATE_PROFILE', {
      updatedFields: Object.keys(req.body), // ex: ['full_name', 'password']
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

// ✅ Modifier son mot de passe
exports.updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const { rows } = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
    if (!rows[0]) return res.status(404).json({ message: 'Utilisateur introuvable' });

    const match = await bcrypt.compare(oldPassword, rows[0].password);
    if (!match) return res.status(400).json({ message: 'Ancien mot de passe incorrect' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ✅ Réinitialiser mot de passe (simulé ici avec token)
exports.resetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!rows[0]) return res.status(404).json({ message: 'Aucun utilisateur trouvé avec cet email' });

    const resetToken = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // En production : envoyer un email avec ce token (ex : lien pour réinitialiser le mot de passe)
    res.json({ message: 'Lien de réinitialisation généré', resetToken });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
