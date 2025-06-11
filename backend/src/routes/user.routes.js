const express = require('express');
const UserController = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware')
const router = express.Router();

router.get('/me', auth, UserController.getProfile);
router.put('/me', auth, UserController.updateProfile);

module.exports = router;
