// src/app.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// 🔥 Charger la stratégie AVANT les routes
require('./config/passport/google.strategy');

// Routes
const adminRoutes = require('./routes/admin.routes');
const autoriteRoutes = require('./routes/autorite.routes');
const logRoutes = require('./routes/log.routes');
const clientRoutes = require('./routes/clients.routes');
const contratRoutes = require('./routes/contrats.routes');
const interventionsRoutes = require('./routes/interventions.routes');
const borneRoute = require('./routes/bornes.routes');
const borneStatusRoutes = require('./routes/bornesStatus.routes');
const alerteRoutes = require('./routes/alertes.routes');
const depotRoutes = require('./routes/depots.routes');
const identificationRoutes = require('./routes/identification.routes');
const statsRoute = require('./routes/stats.routes');
const recompenseRoute = require('./routes/recompenses.routes');
const echangeRoute = require('./routes/echanges.routes');
const notificationRoute = require('./routes/notifications.routes');
const badgeRoute = require('./routes/badges.routes');
const tirageRoute = require('./routes/tirages.routes');
const abonnementRoutes = require('./routes/abonnements.routes');
const paiementRoutes = require('./routes/paiementAbonnement.routes');
const planRoute = require('./routes/plans.route');
const uploadRoute = require('./routes/upload.route');
const pointsRoutes = require('./routes/points.routes');
const paysRoutes = require('./routes/pays.routes');
const villesRoutes = require('./routes/villes.routes');
const communeRoute = require('./routes/commune.routes');
const quartierRoutes = require('./routes/quartier.routes');
const testRoutes = require('./routes/test.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

// ✅ Swagger path corrigé
const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));

const app = express();

// ✅ CORS dynamique (local + prod)
const allowedOrigins = process.env.FRONTEND_URL.split(',');

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// 🛡️ Sessions pour Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // ✅ Railway est en HTTPS → true
      httpOnly: true,
    },
  })
);

// Initialiser Passport
app.use(passport.initialize());
app.use(passport.session());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(helmet());
app.use(rateLimit({ windowMs: 1 * 60 * 1000, max: 100 }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Test route
app.get('/', (req, res) => {
  res.send('RecyTech API is running ✅');
});

// Routes API
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/autorite', autoriteRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/contrats', contratRoutes);
app.use('/api/intervention-borne', interventionsRoutes);
app.use('/api/borne', borneRoute);
app.use('/api/bornes-status', borneStatusRoutes);
app.use('/api/alerte-borne', alerteRoutes);
app.use('/api/depot', depotRoutes);
app.use('/api/identification', identificationRoutes);
app.use('/api/stats', statsRoute);
app.use('/api/recompense', recompenseRoute);
app.use('/api/echanges', echangeRoute);
app.use('/api/notifications', notificationRoute);
app.use('/api/badges', badgeRoute);
app.use('/api/tirages', tirageRoute);
app.use('/api/abonnements', abonnementRoutes);
app.use('/api/paiements-abonnements', paiementRoutes);
app.use('/api/plans', planRoute);
app.use('/api/upload', uploadRoute);
app.use('/api/points', pointsRoutes);
app.use('/api/pays', paysRoutes);
app.use('/api/villes', villesRoutes);
app.use('/api/commune', communeRoute);
app.use('/api/quartiers', quartierRoutes);

module.exports = app;
