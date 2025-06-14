const express = require('express');
const AuthController = require('../controllers/auth.controller');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';


router.post('/register', AuthController.register); // ici doit exister
router.post('/login', AuthController.login);

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    // 👇👇👇 Ceci est **très important** car sinon ça utilise l’URL actuelle
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  })
);

router.get(
  '/google/callback',passport.authenticate('google', {
    failureRedirect: '/login/failed',
    session: false, // ou true si tu gères les sessions
  }),
  (req, res) => {
    // ✅ Rediriger vers frontend ou afficher un message
    res.redirect('http://localhost:3000/profile');
  }
);

module.exports = router;
