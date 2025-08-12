
module.exports = function verifyCapteurKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.CAPTEUR_API_KEY) {
    return res.status(401).json({ message: "Clé API capteur invalide ou absente." });
  }

  next();
};
