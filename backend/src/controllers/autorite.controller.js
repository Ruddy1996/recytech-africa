exports.getRapports = (req, res) => {
  res.json({ message: "Voici les rapports accessibles à l'autorité" });
};

exports.getStats = (req, res) => {
  res.json({ message: "Voici les stats de collecte accessibles à l'autorité" });
};
