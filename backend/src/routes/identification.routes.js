const express = require('express');
const router = express.Router();
const IdentificationController = require('../controllers/identification.controller');

router.get('/nfc/:uid', IdentificationController.getUserByNfc);
router.get('/qr/:qr_code_id', IdentificationController.getUserByQrCode);

module.exports = router;
