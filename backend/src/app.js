const express = require('express');
const cors = require('cors');
const session = require('express-session'); // 👈 Ajouté
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const adminRoutes = require('./routes/admin.routes');
const autoriteRoutes = require('./routes/autorite.routes');
const logRoutes = require('./routes/log.routes');
const clientRoutes = require('./routes/clients.routes');
const contratRoutes = require('./routes/contrats.routes');
const interventionsRoutes = require('./routes/interventions.routes');


// 🔥 Charger la stratégie AVANT les routes
require('./config/passport/google.strategy');

const swaggerDocument = YAML.load('./src/docs/swagger.yaml');
const testRoutes = require('./routes/test.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

const helmet = require('helmet');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // à adapter si tu utilises un frontend différent
  credentials: true
}));

app.use(express.json());

// 🛡️ Sessions pour Passport (obligatoire pour OAuth)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret', // 👈 à mettre dans ton .env
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // mettre à true en prod (HTTPS)
      httpOnly: true,
    },
  })
);

// Initialiser Passport
app.use(passport.initialize());
app.use(passport.session()); // 👈 pour persister les utilisateurs connectés

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(helmet());
app.use(rateLimit({ windowMs: 1 * 60 * 1000, max: 100 }));

// Test route
app.get('/', (req, res) => {
  res.send('RecyTech API is running ✅');
});

// Routes API
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes); // Contient les routes Google
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/autorite', autoriteRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/contrat', contratRoutes);
app.use('/api/intervention-borne', interventionsRoutes);


module.exports = app;
