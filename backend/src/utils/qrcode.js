// utils/qrcode.js
const { v4: uuidv4 } = require('uuid');

function generateQRCodeID() {
  return `QR-${uuidv4()}`;
}

module.exports = { generateQRCodeID };
