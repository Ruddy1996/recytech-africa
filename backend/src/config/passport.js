const passport = require('passport');
const googleStrategy = require('./google.strategy');

// Sérialisation et désérialisation pour gérer la session utilisateur
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const User = require('../models/user.model'); // adapte selon ton modèle utilisateur
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Configuration de la stratégie Google
passport.use(googleStrategy);

module.exports = passport;
