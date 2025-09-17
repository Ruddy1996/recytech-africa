// src/sockets/co2.js (ou directement dans le modèle/controller des bornes)
const FACTEURS_CO2 = {
  plastique: 2.0, // kg CO2 / kg recyclé
  metal: 1.8      // kg CO2 / kg recyclé
};

/**
 * Calcul CO2 évité
 * @param {string} typeDechet - "plastique" ou "metal"
 * @param {number} poidsKg - poids déposé
 * @returns {number} kg CO2 évité
 */
function calculCO2Evite(typeDechet, poidsKg) {
  const facteur = FACTEURS_CO2[typeDechet.toLowerCase()] || 0;
  return parseFloat((poidsKg * facteur).toFixed(2));
}

module.exports = { calculCO2Evite };
