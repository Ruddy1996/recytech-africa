const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🔍 Authorization Header reçu :", authHeader); // <-- LOG

  if (!authHeader) {
    console.log("❌ Aucun header Authorization trouvé !");
    return res.status(401).json({ message: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];
  console.log("🔍 Token extrait :", token); // <-- LOG

  if (!token) {
    console.log("❌ Aucun token après Bearer !");
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ Token valide, payload :", decoded); // <-- LOG
    req.user = decoded;
    next();
  } catch (err) {
    console.log("❌ Erreur vérification token :", err.message); // <-- LOG
    return res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = {
  authenticateToken,
};
