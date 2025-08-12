const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logUserAction = require('../utils/logUserAction');
const { generateQRCodeID } = require('../utils/qrcode');
const LOG_ACTIONS = require('../constants/logActions');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// register
exports.register = async (req, res) => {
  const { email, password, full_name, role } = req.body;
  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser)
      return res.status(400).json({ message: "Utilisateur déjà existant" });

    const newUser = await User.create({ email, password, full_name, role, is_active: true, qr_code_id: generateQRCodeID(),
      points: 0  }); // Ne rehash pas ici

      await logUserAction(newUser.id, LOG_ACTIONS.REGISTER, {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });
      
    res.status(201).json({ message: "Utilisateur créé", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    /* Compte désactivé ? */
    if (!user.is_active) {
      return res.status(403).json({ message: 'Votre compte est désactivé. Veuillez contacter un administrateur.' });
    }

    console.log('Utilisateur trouvé :', user);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Email ou mot de passe incorrect" });

    // Générer le token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logUserAction(user.id, LOG_ACTIONS.LOGIN, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Enlever le mot de passe
    delete user.password;

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
