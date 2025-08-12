// src/routes/capteurs.routes.js
const express = require('express');
const router = express.Router();
const capteursController = require('../controllers/capteurs.controller');
const verifyCapteurKey = require('../middlewares/verifyCapteurKey');

router.post('/', verifyCapteurKey, capteursController.insertCapteur);

module.exports = router;
